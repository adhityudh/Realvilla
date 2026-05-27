async function translateText(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0].map(item => item[0]).join('');
}

async function run() {
  const res = await translateText('Hello world! This is a test. How are you?');
  console.log(res);
}
run();
