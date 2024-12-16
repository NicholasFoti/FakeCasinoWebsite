  //////////////////////////////
  //   WAGER BUTTON HELPERS   //
  //////////////////////////////

  export function handleClearBet() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = '';
  };

  export function handlePlusOne() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 1;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 1;
    }
  };

  export function handlePlusTen() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 10;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 10;
    }
  };

  export function handlePlusOneHundred() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 100;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 100;
    }
  };

  export function handlePlusOneThousand() {
    const wagerInput = document.querySelector('.wager-input input');
    if (wagerInput.value === '') {
      wagerInput.value = 1000;
    } else {
      wagerInput.value = parseFloat(wagerInput.value) + 1000;
    }
  };

  export function handleHalf() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = parseFloat(wagerInput.value) / 2;
  };
  
  export function handleDouble() {
    const wagerInput = document.querySelector('.wager-input input');
    wagerInput.value = parseFloat(wagerInput.value) * 2;
  };

  export function handleMax() {
    const wagerInput = document.querySelector('.wager-input input');
    const userBalance = JSON.parse(localStorage.getItem('user')).balance;
    if(userBalance.toString().includes('.00')) {
      wagerInput.value = parseInt(userBalance);
    } else {
      wagerInput.value = userBalance;
    }
  };