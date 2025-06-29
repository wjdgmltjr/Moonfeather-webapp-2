// app.js

// --- UI 요소 ---
const inputText = document.getElementById('inputText');
const btnSummarize = document.getElementById('btnSummarize');
const btnClear = document.getElementById('btnClear');
const summaryResult = document.getElementById('summaryResult');
const btnCopy = document.getElementById('btnCopy');
const btnSave = document.getElementById('btnSave');
const notesList = document.getElementById('notesList');
const toggleDark = document.getElementById('toggleDark');

let notes = [];

// --- 다크모드 토글 ---
toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// --- 텍스트 초기화 ---
btnClear.addEventListener('click', () => {
  inputText.value = '';
  summaryResult.textContent = '요약된 내용이 여기에 표시됩니다.';
});

// --- 클립보드 복사 ---
btnCopy.addEventListener('click', () => {
  if(summaryResult.textContent.trim() === '' || summaryResult.textContent.includes('여기에')){
    alert('복사할 요약 결과가 없습니다.');
    return;
  }
  navigator.clipboard.writeText(summaryResult.textContent)
    .then(() => alert('요약 결과가 복사되었습니다!'))
    .catch(() => alert('복사에 실패했습니다.'));
});

// --- 로컬저장소 불러오기 ---
function loadNotes() {
  const saved = localStorage.getItem('moonfeather_notes');
  notes = saved ? JSON.parse(saved) : [];
  renderNotes();
}

// --- 노트 렌더링 ---
function renderNotes() {
  notesList.innerHTML = '';
  if(notes.length === 0) {
    notesList.innerHTML = '<li>저장된 노트가 없습니다.</li>';
    return;
  }
  notes.forEach((note, idx) => {
    const li = document.createElement('li');
    li.textContent = note.summary.length > 40 ? note.summary.slice(0,40) + '...' : note.summary;
    const dateSpan = document.createElement('span');
    dateSpan.className = 'date';
    dateSpan.textContent = new Date(note.createdAt).toLocaleString();
    li.appendChild(dateSpan);

    li.addEventListener('click', () => {
      inputText.value = note.original;
      summaryResult.textContent = note.summary;
    });
    notesList.appendChild(li);
  });
}

// --- 노트 저장 ---
btnSave.addEventListener('click', () => {
  if(summaryResult.textContent.trim() === '' || summaryResult.textContent.includes('여기에')){
    alert('저장할 요약 결과가 없습니다.');
    return;
  }
  const newNote = {
    original: inputText.value,
    summary: summaryResult.textContent,
    createdAt: Date.now(),
  };
  notes.unshift(newNote);
  if(notes.length > 20) notes.pop(); // 최대 20개 저장 제한
  localStorage.setItem('moonfeather_notes', JSON.stringify(notes));
  renderNotes();
  alert('노트가 저장되었습니다.');
});

// --- OpenAI API 호출 함수 ---
async function callOpenAI(text) {
  const apiKey = prompt("OpenAI API 키를 입력하세요:");
  if (!apiKey) {
    alert("API 키가 필요합니다.");
    return null;
  }
  
  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      {role: "system", content: "You are a helpful assistant that summarizes text."},
      {role: "user", content: `다음 텍스트를 한국어로 간결하게 요약해줘:\\n\\n${text}`}
    ],
    temperature: 0.5,
    max_tokens: 300,
  };
  
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      alert(`OpenAI API 오류: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.choices[0].message.content.trim();
  } catch (e) {
    alert("API 호출 중 오류가 발생했습니다.");
    console.error(e);
    return null;
  }
}

// --- 요약 기능 (OpenAI 호출 포함) ---
btnSummarize.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if(text.length < 10) {
    alert('요약할 텍스트를 10자 이상 입력해주세요.');
    return;
  }
  summaryResult.textContent = '요약 중... 잠시만 기다려주세요.';

  const summary = await callOpenAI(text);
  if (summary) {
    summaryResult.textContent = summary;
  } else {
    summaryResult.textContent = '요약에 실패했습니다.';
  }
});

// --- 초기화 ---
loadNotes();
