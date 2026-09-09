/*
 * Flat vs Reducing Balance Interest Rate Calculator
 *
 * Flat rate interest is simple interest on the original principal for the
 * whole tenure: totalInterest = P * rate * years.
 *
 * Reducing (diminishing) balance rate is the standard amortising loan
 * formula, where interest is charged only on the outstanding principal
 * each month.
 *
 * "Equivalent" rate conversion: given one method's EMI, find the annual
 * rate that produces the SAME EMI under the other method. Reducing -> Flat
 * has a closed form; Flat -> Reducing requires solving the amortisation
 * formula for the rate, so we bisect (the EMI is monotonic in rate).
 */

function flatEmiAndTotals(principal, annualRatePct, months) {
  const years = months / 12;
  const rate = annualRatePct / 100;
  const totalInterest = principal * rate * years;
  const totalPayment = principal + totalInterest;
  const emi = totalPayment / months;
  return { emi, totalInterest, totalPayment };
}

function reducingEmiAndTotals(principal, annualRatePct, months) {
  const monthlyRate = annualRatePct / 100 / 12;
  let emi;
  if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalInterest, totalPayment };
}

// Closed form: given a target EMI, find the flat annual rate that produces it.
function flatRateForEmi(principal, targetEmi, months) {
  const years = months / 12;
  const totalPayment = targetEmi * months;
  const totalInterest = totalPayment - principal;
  return (totalInterest / (principal * years)) * 100;
}

// No closed form for reducing-balance rate given a target EMI -> bisect.
function reducingRateForEmi(principal, targetEmi, months) {
  let lo = 0;
  let hi = 500; // annual %, generously wide upper bound
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const { emi } = reducingEmiAndTotals(principal, mid, months);
    if (emi > targetEmi) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return (lo + hi) / 2;
}

function formatCurrency(value) {
  if (!isFinite(value)) return '—';
  return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatRate(value) {
  if (!isFinite(value)) return '—';
  return value.toFixed(2) + '%';
}

function readInputs() {
  const principal = parseFloat(document.getElementById('loanAmount').value) || 0;
  const years = parseFloat(document.getElementById('tenureYears').value) || 0;
  const extraMonths = parseFloat(document.getElementById('tenureMonths').value) || 0;
  const flatRate = parseFloat(document.getElementById('flatRate').value) || 0;
  const reducingRate = parseFloat(document.getElementById('reducingRate').value) || 0;
  const months = Math.round(years * 12 + extraMonths);
  return { principal, months, flatRate, reducingRate };
}

function setSavings(el, diff) {
  if (diff > 0.5) {
    el.textContent = `You will pay ${formatCurrency(diff)} more`;
    el.className = 'savings more';
  } else if (diff < -0.5) {
    el.textContent = `You will pay ${formatCurrency(Math.abs(diff))} less`;
    el.className = 'savings less';
  } else {
    el.textContent = 'Both methods cost about the same';
    el.className = 'savings';
  }
}

function recalculate() {
  const { principal, months, flatRate, reducingRate } = readInputs();

  if (principal <= 0 || months <= 0) {
    return;
  }

  const flat = flatEmiAndTotals(principal, flatRate, months);
  const reducing = reducingEmiAndTotals(principal, reducingRate, months);

  const equivReducingForFlat = reducingRateForEmi(principal, flat.emi, months);
  const equivFlatForReducing = flatRateForEmi(principal, reducing.emi, months);

  document.getElementById('flatRateOut').textContent = formatRate(flatRate);
  document.getElementById('flatEquivReducing').textContent = formatRate(equivReducingForFlat);
  document.getElementById('flatEmi').textContent = formatCurrency(flat.emi);
  document.getElementById('flatTotalInterest').textContent = formatCurrency(flat.totalInterest);
  document.getElementById('flatTotalPayment').textContent = formatCurrency(flat.totalPayment);
  setSavings(document.getElementById('flatSavings'), flat.totalPayment - reducing.totalPayment);

  document.getElementById('reducingRateOut').textContent = formatRate(reducingRate);
  document.getElementById('reducingEquivFlat').textContent = formatRate(equivFlatForReducing);
  document.getElementById('reducingEmi').textContent = formatCurrency(reducing.emi);
  document.getElementById('reducingTotalInterest').textContent = formatCurrency(reducing.totalInterest);
  document.getElementById('reducingTotalPayment').textContent = formatCurrency(reducing.totalPayment);
  setSavings(document.getElementById('reducingSavings'), reducing.totalPayment - flat.totalPayment);
}

document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('input', recalculate);
});

recalculate();
