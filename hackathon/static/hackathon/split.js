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

  // sample contacts
  const contacts = [
    {name:'Ana', id:'ana'},
    {name:'Boris', id:'boris'},
    {name:'Cvetka', id:'cvetka'},
  ]

  function renderContacts(){
    contactsEl.innerHTML = ''
    contacts.forEach(c=>{
      const li = document.createElement('li')
      li.textContent = c.name
      li.dataset.id = c.id
      li.addEventListener('click', ()=>{
        addPerson(c.name)
        hidePicker()
      })
      contactsEl.appendChild(li)
    })
    // add a small hint
    const hint = document.createElement('div')
    hint.style.fontSize = '12px'
    hint.style.color = '#6b7280'
    hint.style.marginTop = '8px'
    hint.textContent = 'Izberite kontakt ali dodajte po meri.'
    contactsEl.parentNode.insertBefore(hint, contactsEl.nextSibling)
  }

  function showPicker(){picker.classList.remove('hidden')}
  function hidePicker(){picker.classList.add('hidden')}

  addBtn.addEventListener('click', ()=>{renderContacts(); showPicker()})
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
    const diff = (sum - total)
    if(sum >= total && total > 0){
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

  // even split: distribute total equally among all person rows
  evenBtn.addEventListener('click', ()=>{
    const total = getTotalAmount()
    const rows = Array.from(document.querySelectorAll('.person'))
    if(rows.length === 0) return
    const per = +(total / rows.length).toFixed(2)
    // set each input
    rows.forEach(r=>{
      const inp = r.querySelector('.share')
      if(inp) inp.value = per
    })
    updateCoverage()
  })

  splitBtn.addEventListener('click', ()=>{
    if(splitBtn.disabled) return
    const shares = Array.from(document.querySelectorAll('.person .share')).map(i=>parseFloat(i.value)||0)
    const sum = shares.reduce((s,v)=>s+v,0)
    const total = getTotalAmount()
    if(sum < total){
      alert('Račun ni v celoti pokrit — dopolnite zneske.')
      return
    }
    // For now show confirmation; in real app this would POST to server
    alert('Plačilo pripravljeno — skupni znesek: $' + total.toFixed(2))
  })
})
