async function testTa() {
  const text = "Your application for Kisan Credit Card renewal with credit limit Rs 50,000 has been sanctioned with 4% interest subvention. Please visit the rural branch with your Aadhaar and Land Passbook to collect your KCC RuPay card.";
  const urlMem = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 200))}&langpair=en|ta`;
  const resMem = await fetch(urlMem);
  const dataMem = await resMem.json();
  console.log("=== TAMIL TRANSLATION ===");
  console.log(dataMem?.responseData?.translatedText);
}
testTa();
