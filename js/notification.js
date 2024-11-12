document.querySelectorAll('.request-card').forEach(card => {
    const pendingBtn = card.querySelector('.pending');
    const approvedBtn = card.querySelector('.approved');
    const declinedBtn = card.querySelector('.declined');
    
    pendingBtn.addEventListener('click', () => {
        card.querySelector('.pending-msg').style.display = 'block';
        card.querySelector('.approved-msg').style.display = 'none';
        card.querySelector('.declined-msg').style.display = 'none';
    });

    approvedBtn.addEventListener('click', () => {
        card.querySelector('.approved-msg').style.display = 'block';
        card.querySelector('.pending-msg').style.display = 'none';
        card.querySelector('.declined-msg').style.display = 'none';
    });

    declinedBtn.addEventListener('click', () => {
        card.querySelector('.declined-msg').style.display = 'block';
        card.querySelector('.pending-msg').style.display = 'none';
        card.querySelector('.approved-msg').style.display = 'none';
    });
});
