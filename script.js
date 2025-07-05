
document.querySelector("#ask-button").addEventListener("click", async () => {
  const input = document.querySelector("#question-input").value;
  const responseDiv = document.querySelector("#response");
  responseDiv.innerText = "GPT가 생각 중입니다...";

  // 실제 Firebase Cloud Function 주소로 바꿔주세요
  const res = await fetch("https://us-central1-your-project-id.cloudfunctions.net/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: input })
  });

  const data = await res.json();
  responseDiv.innerText = data.answer;
});
document.querySelector("#ask-button").addEventListener("click", async () => {
  const question = document.querySelector("#question-input").value;
  const responseBox = document.querySelector("#response");
  responseBox.innerText = "답변을 불러오는 중이에요...";

  const res = await fetch("https://us-central1-your-project-id.cloudfunctions.net/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: question })
  });

  const data = await res.json();
  responseBox.innerText = data.answer;
});
