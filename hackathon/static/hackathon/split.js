document.addEventListener('DOMContentLoaded', function(){
  const addBtn = document.getElementById('add-person')
  const picker = document.getElementById('picker')
  const contactsEl = document.getElementById('contacts')
  const closePicker = document.getElementById('close-picker')
  const addCustom = document.getElementById('add-custom')
  const customInput = document.getElementById('custom-input')
  const peopleList = document.getElementById('people-list')
  const splitBtn = document.getElementById('split-button')
  const coverageMsg = document.getElementById('coverage-message')
  const evenBtn = document.getElementById('even-split')

  // sample contacts (mutable so selected ones can be removed)
  let contacts = [
    {name:'Anja', id:'anja'},
    {name:'Ilija', id:'ilija'},
    {name:'Hanah', id:'hanah'},
    {name:'Boris', id:'boris'},
  ];

  function renderContacts(){
    contactsEl.innerHTML = ''
    contacts.forEach(c=>{
      const li = document.createElement('li')
      li.textContent = c.name
      li.dataset.id = c.id
      li.addEventListener('click', ()=>{
        // add the person and remove them from available contacts
        addPerson(c.name)
        contacts = contacts.filter(x => x.id !== c.id)
        renderContacts()
        hidePicker()
      })
      contactsEl.appendChild(li)
    })
    // add a small hint (only once)
    if(!contactsEl.parentNode.querySelector('.contacts-hint')){
      const hint = document.createElement('div')
      hint.className = 'contacts-hint'
      hint.textContent = 'Izberite kontakt ali dodajte po meri.'
      contactsEl.parentNode.insertBefore(hint, contactsEl.nextSibling)
    }
  }

  function showPicker(){picker.classList.remove('hidden')}
  function hidePicker(){picker.classList.add('hidden')}

  addBtn.addEventListener('click', ()=>{renderContacts(); showPicker();
    // give focus to contacts list so touch scrolls inside
    setTimeout(()=>contactsEl.focus(),50)
  })
  closePicker.addEventListener('click', hidePicker)

  addCustom.addEventListener('click', ()=>{
    const v = customInput.value.trim()
    if(!v) return
    addPerson(v)
    customInput.value = ''
    hidePicker()
  })

  function addPerson(name){
    const id = 'p_'+Date.now()
    const row = document.createElement('div')
    row.className = 'person row'
    row.dataset.id = id
    row.innerHTML = `<div class="avatar">${name.charAt(0).toUpperCase()}</div>
      <div class="name">${name}</div>
      <input class="share" type="number" step="0.01" placeholder="0.00" value="0.00" />
      <button class="remove" title="Odstrani" aria-label="Odstrani">✕</button>`
    peopleList.appendChild(row)
    // attach remove handler
    row.querySelector('.remove').addEventListener('click', ()=>row.remove())
    // focus the new input
    const input = row.querySelector('.share')
    input.addEventListener('input', updateCoverage)
    setTimeout(()=>input.focus(),40)
    // ensure people list scrolls to show the new person
    setTimeout(()=>row.scrollIntoView({behavior:'smooth',block:'end'}),80)
  }

  function getTotalAmount(){
    // read total from DOM (strip any $)
    const totalText = document.querySelector('.total').textContent || ''
    return parseFloat(totalText.replace(/[^0-9.\-]+/g,'')) || 0
  }

  function updateCoverage(){
    const shares = Array.from(document.querySelectorAll('.person .share')).map(i=>parseFloat(i.value)||0)
    const sum = shares.reduce((s,v)=>s+v,0)
    const total = getTotalAmount()
    const diff = +(sum - total).toFixed(2)
    if((diff >= 0 && Math.abs(diff) < 0.005) || (sum >= total && total > 0)){
      coverageMsg.textContent = 'Račun je v celoti pokrit.'
      splitBtn.disabled = false
    } else {
      const remaining = (total - sum).toFixed(2)
      coverageMsg.textContent = `Ni polno pokrito — manjkajo $${remaining}`
      splitBtn.disabled = true
    }
  }

  // initialize coverage for existing inputs
  document.querySelectorAll('.person .share').forEach(i=>i.addEventListener('input', updateCoverage))
  updateCoverage()

  // even split: distribute total equally among all person rows, rounding up per-person
  evenBtn.addEventListener('click', ()=>{
    const total = getTotalAmount()
    const rows = Array.from(document.querySelectorAll('.person'))
    const n = rows.length
    if(n === 0) return
    const raw = total / n
    // round up to nearest cent
    const perCeil = Math.ceil(raw * 100) / 100
    rows.forEach((r,i)=>{
      const inp = r.querySelector('.share')
      if(!inp) return
      if(i < n - 1){
        inp.value = perCeil.toFixed(2)
      } else {
        // last person gets the remainder so the sum equals total
        const sumPrev = perCeil * (n - 1)
        const lastVal = +(total - sumPrev).toFixed(2)
        inp.value = (lastVal > 0 ? lastVal.toFixed(2) : perCeil.toFixed(2))
      }
    })
    updateCoverage()
  })

  splitBtn.addEventListener('click', ()=>{
    if(splitBtn.disabled) return
    const shares = Array.from(document.querySelectorAll('.person .share')).map(i=>parseFloat(i.value)||0)
    const sum = shares.reduce((s,v)=>s+v,0)
    const total = getTotalAmount()
    // allow small rounding deltas
    if(sum + 0.001 < total){
      alert('Račun ni v celoti pokrit — dopolnite zneske.')
      return
    }
    // show payment overlay with spinner, then a check
    const overlay = document.getElementById('payment-overlay')
    const spinner = document.getElementById('payment-spinner')
    const check = document.getElementById('payment-check')
    const text = document.getElementById('payment-text')
    overlay.classList.remove('hidden')
    check.style.display = 'none'
    spinner.style.display = ''
    text.textContent = 'Procesiranje plačila...'
    // simulate async payment: longer spinner, then show check for a bit
    setTimeout(()=>{
      spinner.style.display = 'none'
      // show the check SVG
      check.style.display = 'block'
      text.textContent = 'Plačilo uspešno'
      // hide after a longer delay so user sees success
      setTimeout(()=>overlay.classList.add('hidden'),2000)
    },2000)
  })
})
