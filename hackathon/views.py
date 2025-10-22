from django.shortcuts import render


def split_bill(request):
    # For now render static page; JS will handle dynamic interactions
    context = {
        'total': 123.45,  # placeholder; you can replace with real value
    }
    return render(request, 'hackathon/split.html', context)
