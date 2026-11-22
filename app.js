/**
 * QUANG MINH AI DATA ANALYST — CORE APP CONTROLLER
 * Full 6-Step Workflow Preserved:
 * Step 1: Tiếp Nhận Dữ Liệu
 * Step 2: Làm Sạch & Duyệt
 * Step 3: Bài Toán Doanh Nghiệp
 * Step 4: Yêu Cầu & Gợi Ý AI
 * Step 5: Dashboard & Xác Nhận
 * Step 6: Xuất Bộ Báo Cáo & Hệ Thống Biểu Đồ Toàn Diện (6 KPIs, 6 Charts, Scorecard, Q&A, Roadmap, 1-Click Export)
 */

const state = {
  currentStep: 1,
  currentRows: [],
  originalRows: [],
  profile: null,
  context: 'retail',
  selectedIndustry: 'retail',
  businessProblem: 'growth',
  extraBusinessNotes: '',
  isDataApproved: false,
  isReportConfirmed: false,
  validation: null,
  directives: {
    filterPeriod: null,
    excludeGroup: null,
    targetGoal: null
  },
  currentAngleIndex: 0,
  agreedQuestions: [],
  tablePage: 1,
  tableRowsPerPage: 20,
  tableFilterQuery: '',
  charts: {
    trendStep5: null,
    donutStep5: null,
    trend: null,
    donut: null,
    bar: null,
    comparison: null,
    radar: null,
    variance: null
  }
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initUploadTabsAndIngestion();
  initTableAndCleaningGate();
  initBusinessProblemHandlers();
  initScopeAndChat();
  initStep5DashboardHandlers();
  initStep6ReportHandlers();
  initExecutiveExportSuite();
  initDualBrainModal();
  initGuideModal();
  initCustomCursor();
  initAmbientParticles();

  // Luôn giữ cố định tại Bước 1 (Tiếp Nhận Đa Nguồn Dữ Liệu) khi vừa mở web
  goToStep(1);
});

// =========================================================================
// 1. THEME & STEPPER NAVIGATION (6 BƯỚC GIỮ NGUYÊN)
// =========================================================================
function initTheme() {
  const btn = document.getElementById('btnThemeToggle');
  const savedTheme = localStorage.getItem('qm_theme') || 'theme-dark';
  document.body.className = savedTheme;
  updateThemeIcon(savedTheme);

  btn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    const newTheme = isDark ? 'theme-light' : 'theme-dark';
    document.body.className = newTheme;
    localStorage.setItem('qm_theme', newTheme);
    updateThemeIcon(newTheme);
    if (state.currentStep === 5) renderStep5Dashboard();
    if (state.currentStep === 6) renderStep6Report();
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#btnThemeToggle i');
  if (icon) {
    icon.className = theme === 'theme-dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

function initNavigation() {
  const pills = document.querySelectorAll('.step-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const step = parseInt(pill.dataset.step, 10);
      if ((!state.currentRows || state.currentRows.length === 0) && step > 1) {
        alert('Hệ thống chưa ghi nhận tệp dữ liệu nào!\n\nVui lòng kéo thả hoặc chọn tệp Excel / CSV tại Bước 1 thì hệ thống mới kích hoạt và tính toán các thông số.');
        return;
      }
      if (step > 2 && !state.isDataApproved) {
        alert('Vui lòng duyệt làm sạch dữ liệu ở Bước 2 trước khi tiếp tục.');
        return;
      }
      goToStep(step);
    });
  });
  updateStepperLockState();
}

function updateStepperLockState() {
  const hasData = state.currentRows && state.currentRows.length > 0;
  document.querySelectorAll('.step-pill').forEach(pill => {
    const s = parseInt(pill.dataset.step, 10);
    if (s > 1) {
      pill.classList.toggle('locked', !hasData);
      if (!hasData) {
        pill.title = 'Chưa có tệp: Vui lòng nạp tệp tại Bước 1 để mở khóa';
      } else {
        pill.removeAttribute('title');
      }
    }
  });
}

function goToStep(stepNumber) {
  if (stepNumber > 1 && (!state.currentRows || state.currentRows.length === 0)) {
    stepNumber = 1;
    alert('Chưa có tệp dữ liệu! Hệ thống bắt buộc phải nạp tệp tại Bước 1 thì mới có thông số và biểu đồ.');
  }

  state.currentStep = stepNumber;
  updateStepperLockState();

  document.querySelectorAll('.stepper-nav .step-pill').forEach(pill => {
    const s = parseInt(pill.dataset.step, 10);
    pill.classList.toggle('active', s === stepNumber);
  });

  document.querySelectorAll('.workflow-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.getElementById(`step${stepNumber}-section`);
  if (targetSec) targetSec.classList.add('active');

  if (stepNumber === 2) {
    renderValidationGate();
  } else if (stepNumber === 3) {
    renderBusinessContextSection();
  } else if (stepNumber === 4) {
    renderScopeSection();
  } else if (stepNumber === 5) {
    renderStep5Dashboard();
  } else if (stepNumber === 6) {
    renderStep6Report();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================================
// 2. STEP 1: INGESTION (SHEET, RAW TEXT, LINK GOOGLE SHEETS / DOCS)
// =========================================================================
function initUploadTabsAndIngestion() {
  const tabBtns = document.querySelectorAll('.ingest-tabs-bar .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      document.getElementById(targetId).classList.add('active');
    });
  });

  const dropZone = document.getElementById('fileDropZone');
  const fileInput = document.getElementById('fileInput');

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelected(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelected(e.target.files[0]);
  });

  document.getElementById('btnParseTextData').addEventListener('click', () => {
    const text = document.getElementById('rawTextDataInput').value.trim();
    if (!text) {
      alert('Vui lòng dán nội dung bảng dữ liệu vào ô văn bản.');
      return;
    }
    parseCSVOrText(text, 'Dữ liệu từ Text');
  });

  document.getElementById('btnLoadCloudDoc').addEventListener('click', handleCloudLinkLoad);

  document.querySelectorAll('.btn-download-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.dataset.sample;
      downloadSampleExcelFile(sampleKey);
    });
  });
}

function downloadSampleExcelFile(sampleKey) {
  if (!SAMPLE_DATASETS || !SAMPLE_DATASETS[sampleKey]) {
    alert('Không tìm thấy tệp mẫu.');
    return;
  }
  const rawData = SAMPLE_DATASETS[sampleKey];
  const ws = XLSX.utils.json_to_sheet(rawData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Du_Lieu");
  const fileName = `QuangMinh_Mau_${sampleKey.toUpperCase()}.xlsx`;
  XLSX.writeFile(wb, fileName);
  alert(`Đã tải tệp "${fileName}" về máy tính!\n\nBây giờ bạn hãy chọn hoặc kéo thả tệp này vào ô bên trái để hệ thống đọc dữ liệu và kích hoạt thông số.`);
}

function handleFileSelected(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSVOrText(e.target.result, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      processLoadedData(json, file.name);
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert('Hệ thống hỗ trợ tệp CSV, XLSX hoặc XLS.');
  }
}

function parseCSVOrText(rawText, sourceName) {
  const lines = rawText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    alert('Dữ liệu không đủ dòng (cần tối thiểu 1 dòng tiêu đề và 1 dòng số liệu).');
    return;
  }

  const firstLine = lines[0];
  let delimiter = '\t';
  if ((firstLine.match(/\t/g) || []).length > 0) {
    delimiter = '\t';
  } else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  } else if ((firstLine.match(/,/g) || []).length > 0) {
    delimiter = ',';
  }

  const parseLine = (line) => {
    const row = [];
    let insideQuotes = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row.map(item => item.replace(/^"|"$/g, '').trim());
  };

  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        const val = values[idx];
        const cleanNum = val.replace(/[,.\sđ$%]/g, '');
        if (!isNaN(cleanNum) && cleanNum !== '' && !isNaN(Number(cleanNum))) {
          obj[h] = Number(cleanNum);
        } else {
          obj[h] = val;
        }
      });
      rows.push(obj);
    }
  }

  processLoadedData(rows, sourceName);
}

async function handleCloudLinkLoad() {
  const urlInput = document.getElementById('cloudDocUrl');
  const url = urlInput.value.trim();
  if (!url) {
    alert('Vui lòng nhập đường link Google Sheets hoặc Google Docs hợp lệ.');
    return;
  }

  try {
    if (url.includes('spreadsheets/d/')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const sheetId = match[1];
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        const resp = await fetch(exportUrl);
        if (!resp.ok) {
          alert('Không thể tải Google Sheet. Vui lòng đảm bảo tệp đã bật: "Bất kỳ ai có đường liên kết đều có thể xem".');
          return;
        }
        const csv = await resp.text();
        parseCSVOrText(csv, 'Google Sheet Cloud');
        return;
      }
    }

    if (url.includes('document/d/')) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const docId = match[1];
        const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
        const resp = await fetch(exportUrl);
        if (!resp.ok) {
          alert('Không thể tải Google Docs. Vui lòng đảm bảo tệp đã bật chia sẻ công khai.');
          return;
        }
        const text = await resp.text();
        parseCSVOrText(text, 'Google Docs Cloud');
        return;
      }
    }

    alert('Định dạng liên kết Google Drive chưa đúng chuẩn.');
  } catch (err) {
    alert('Lỗi nạp liên kết: ' + err.message);
  }
}

function processLoadedData(data, sourceName) {
  if (!data || data.length === 0) {
    alert('Dữ liệu rỗng!');
    return;
  }

  state.currentRows = data;
  state.originalRows = JSON.parse(JSON.stringify(data));
  state.profile = agentEngine.buildFileDataProfile(data);
  state.context = agentEngine.detectBusinessContext(state.profile, state.selectedIndustry);
  state.validation = agentEngine.validateDataset(data, state.profile);
  state.isDataApproved = false;

  goToStep(2);
}

// =========================================================================
// 3. STEP 2: LÀM SẠCH DỮ LIỆU & BỘ MẪU CHUẨN (DUYỆT BƯỚC NÀY)
// =========================================================================
function renderValidationGate() {
  const val = state.validation;
  if (!val || !state.currentRows || state.currentRows.length === 0) {
    document.getElementById('healthScoreValue').textContent = '--';
    document.getElementById('statTotalRows').textContent = '0';
    document.getElementById('statTotalCols').textContent = '0';
    document.getElementById('statTotalErrors').textContent = '0';
    document.getElementById('statGateApprovalStatus').textContent = 'Chưa Có Dữ Liệu';
    return;
  }

  document.getElementById('healthScoreValue').textContent = `${val.healthScore}%`;
  document.getElementById('statTotalRows').textContent = state.currentRows.length.toLocaleString('vi-VN');
  document.getElementById('statTotalCols').textContent = state.profile.columns.length;
  document.getElementById('statTotalErrors').textContent = val.totalErrors.toLocaleString('vi-VN');

  const approvalBadge = document.getElementById('statGateApprovalStatus');
  if (state.isDataApproved) {
    approvalBadge.className = 'stat-badge badge-success';
    approvalBadge.textContent = 'Đã Phê Duyệt';
  } else {
    approvalBadge.className = 'stat-badge badge-warning';
    approvalBadge.textContent = 'Chờ Duyệt Làm Sạch';
  }

  const chipsWrapper = document.getElementById('issueChipsWrapper');
  const chipsList = document.getElementById('issueChipsList');
  if (val.issues && val.issues.length > 0) {
    chipsWrapper.style.display = 'flex';
    chipsList.innerHTML = val.issues.slice(0, 5).map(issue => `
      <div class="issue-chip">
        <i class="fa-solid fa-triangle-exclamation text-amber"></i> Dòng ${issue.row}, Cột "${issue.col}": ${issue.issue}
      </div>
    `).join('');
  } else {
    chipsWrapper.style.display = 'none';
  }

  renderInteractiveTable();
}

function initTableAndCleaningGate() {
  document.getElementById('tableSearchInput').addEventListener('input', (e) => {
    state.tableFilterQuery = e.target.value.toLowerCase();
    state.tablePage = 1;
    renderInteractiveTable();
  });

  document.getElementById('btnAutoCleanData').addEventListener('click', () => {
    autoCleanCurrentData();
  });

  document.getElementById('btnLoadCleanTemplate').addEventListener('click', () => {
    state.currentRows = JSON.parse(JSON.stringify(CLEAN_DATA_TEMPLATE));
    state.originalRows = JSON.parse(JSON.stringify(CLEAN_DATA_TEMPLATE));
    state.profile = agentEngine.buildFileDataProfile(state.currentRows);
    state.validation = agentEngine.validateDataset(state.currentRows, state.profile);
    renderValidationGate();
    alert('Đã nạp thành công Bộ Dữ Liệu Làm Sạch Mẫu Chuẩn (100% Clean Template)!');
  });

  document.getElementById('btnResetTableData').addEventListener('click', () => {
    state.currentRows = JSON.parse(JSON.stringify(state.originalRows));
    state.validation = agentEngine.validateDataset(state.currentRows, state.profile);
    renderValidationGate();
    alert('Đã khôi phục dữ liệu gốc.');
  });

  const btnAskAi = document.getElementById('btnAskAiFromTable');
  if (btnAskAi) {
    btnAskAi.addEventListener('click', () => {
      goToStep(4);
      setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) input.focus();
      }, 350);
    });
  }

  // DUYỆT BƯỚC NÀY
  document.getElementById('btnApproveCleanData').addEventListener('click', () => {
    state.isDataApproved = true;
    renderValidationGate();
    goToStep(3);
  });
}

function autoCleanCurrentData() {
  let cleanedCount = 0;
  state.currentRows.forEach(row => {
    state.profile.metrics.forEach(mCol => {
      if (row[mCol] === null || row[mCol] === undefined || String(row[mCol]).trim() === '') {
        row[mCol] = 0;
        cleanedCount++;
      }
    });
    state.profile.dimensions.forEach(dCol => {
      if (row[dCol] === null || row[dCol] === undefined || String(row[dCol]).trim() === '') {
        row[dCol] = 'Chưa xác định';
        cleanedCount++;
      }
    });
  });

  state.validation = agentEngine.validateDataset(state.currentRows, state.profile);
  renderValidationGate();
  alert(`Đã tự động xử lý và điền chuẩn hóa ${cleanedCount} ô dữ liệu khuyết thiếu!`);
}

function renderInteractiveTable() {
  const tableHeader = document.getElementById('tableHeader');
  const tableBody = document.getElementById('tableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const paginationControls = document.getElementById('paginationControls');

  const cols = state.profile.columns;

  let filtered = state.currentRows;
  if (state.tableFilterQuery) {
    filtered = state.currentRows.filter(row => {
      return Object.values(row).some(v => String(v).toLowerCase().includes(state.tableFilterQuery));
    });
  }

  const totalRows = filtered.length;
  const totalPages = Math.ceil(totalRows / state.tableRowsPerPage) || 1;
  const startIdx = (state.tablePage - 1) * state.tableRowsPerPage;
  const pageRows = filtered.slice(startIdx, startIdx + state.tableRowsPerPage);

  tableHeader.innerHTML = `<tr>
    <th style="width: 50px;">#</th>
    ${cols.map(c => `<th>${c}</th>`).join('')}
  </tr>`;

  tableBody.innerHTML = pageRows.map((row, rIdx) => {
    const actualRowIdx = startIdx + rIdx;
    return `<tr>
      <td style="color: var(--text-dim);">${actualRowIdx + 1}</td>
      ${cols.map(c => {
        const val = row[c];
        const isError = val === null || val === undefined || String(val).trim() === '';
        const displayVal = isError ? '<em class="text-danger">[Trống]</em>' : val;
        return `<td class="cell-editable ${isError ? 'cell-error' : ''}" data-row="${actualRowIdx}" data-col="${c}">${displayVal}</td>`;
      }).join('')}
    </tr>`;
  }).join('');

  tableBody.querySelectorAll('.cell-editable').forEach(cell => {
    cell.addEventListener('dblclick', () => {
      const rIdx = parseInt(cell.dataset.row, 10);
      const colName = cell.dataset.col;
      const currentVal = state.currentRows[rIdx][colName] ?? '';
      const newVal = prompt(`Sửa giá trị [${colName}] tại dòng ${rIdx + 1}:`, currentVal);
      if (newVal !== null) {
        state.currentRows[rIdx][colName] = isNaN(newVal) || newVal.trim() === '' ? newVal : Number(newVal);
        state.validation = agentEngine.validateDataset(state.currentRows, state.profile);
        renderValidationGate();
      }
    });
  });

  paginationInfo.textContent = `Hiển thị ${Math.min(startIdx + 1, totalRows)} - ${Math.min(startIdx + state.tableRowsPerPage, totalRows)} của ${totalRows.toLocaleString('vi-VN')} dòng`;
  paginationControls.innerHTML = `
    <button class="btn btn-sm btn-ghost" ${state.tablePage <= 1 ? 'disabled' : ''} id="btnPrevPage"><i class="fa-solid fa-chevron-left"></i> Trước</button>
    <span style="font-weight: 600; margin: 0 0.5rem;">Trang ${state.tablePage} / ${totalPages}</span>
    <button class="btn btn-sm btn-ghost" ${state.tablePage >= totalPages ? 'disabled' : ''} id="btnNextPage">Sau <i class="fa-solid fa-chevron-right"></i></button>
  `;

  document.getElementById('btnPrevPage')?.addEventListener('click', () => {
    if (state.tablePage > 1) {
      state.tablePage--;
      renderInteractiveTable();
    }
  });

  document.getElementById('btnNextPage')?.addEventListener('click', () => {
    if (state.tablePage < totalPages) {
      state.tablePage++;
      renderInteractiveTable();
    }
  });
}

// =========================================================================
// 4. STEP 3: BỐI CẢNH DOANH NGHIỆP & BÀI TOÁN CẦN GIẢI QUYẾT
// =========================================================================
function initBusinessProblemHandlers() {
  const cards = document.querySelectorAll('#industryPillsContainer .option-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.selectedIndustry = card.dataset.industry;
      state.context = agentEngine.detectBusinessContext(state.profile, state.selectedIndustry);
      renderAdaptiveQuestions();
    });
  });

  const radioItems = document.querySelectorAll('.problem-radio-item');
  radioItems.forEach(item => {
    item.addEventListener('click', () => {
      radioItems.forEach(r => r.classList.remove('active'));
      item.classList.add('active');
      const radio = item.querySelector('input[type="radio"]');
      radio.checked = true;
      state.businessProblem = radio.value;
      renderAdaptiveQuestions();
    });
  });

  document.getElementById('btnConfirmBusinessContext').addEventListener('click', () => {
    state.extraBusinessNotes = document.getElementById('extraBusinessNotes').value.trim();
    goToStep(4);
  });
}

function renderBusinessContextSection() {
  document.querySelectorAll('#industryPillsContainer .option-card').forEach(card => {
    card.classList.toggle('active', card.dataset.industry === state.selectedIndustry);
  });
  renderAdaptiveQuestions();
}

function renderAdaptiveQuestions() {
  const angle = agentEngine.generateAdaptiveQuestions(state.profile, state.context, state.businessProblem, state.currentAngleIndex);
  document.getElementById('angleIndicatorBadge').textContent = angle.angleName;

  const list = document.getElementById('suggestedQuestionsList');
  list.innerHTML = angle.questions.map(q => `
    <div class="question-item" data-question="${q}">
      <i class="fa-solid fa-circle-question"></i>
      <span>${q}</span>
    </div>
  `).join('');

  list.querySelectorAll('.question-item').forEach(item => {
    item.addEventListener('click', () => {
      const qText = item.dataset.question;
      addUserChatMessage(qText);
      handleAgentChatResponse(qText);
    });
  });
}

// =========================================================================
// 5. STEP 4: YÊU CẦU & GỢI Ý TỪ AI (CHƯA PHÂN TÍCH NGAY)
// =========================================================================
function renderScopeSection() {
  const p = state.profile;
  if (!p) return;

  document.getElementById('detectedContextTag').textContent = agentEngine.getContextLabel(state.context);
  document.getElementById('profilePeriodsText').textContent = p.periods.length > 0 ? p.periods.join(', ') : 'Lũy kế toàn bộ bảng';

  document.getElementById('profileDimensionsCloud').innerHTML = p.dimensions.map(d => `<span class="badge-tag">${d}</span>`).join('');
  document.getElementById('profileMetricsCloud').innerHTML = p.metrics.map(m => `<span class="badge-tag badge-primary">${m}</span>`).join('');

  renderAdaptiveQuestions();
}

function initScopeAndChat() {
  document.getElementById('btnRefreshQuestions').addEventListener('click', () => {
    state.currentAngleIndex++;
    renderAdaptiveQuestions();
  });

  const chatInput = document.getElementById('chatInput');
  const btnSendChat = document.getElementById('btnSendChat');

  const sendMsg = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addUserChatMessage(text);
    handleAgentChatResponse(text);
  };

  btnSendChat.addEventListener('click', sendMsg);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMsg();
  });

  document.querySelectorAll('.quick-prompt-chips .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.dataset.prompt;
      addUserChatMessage(promptText);
      handleAgentChatResponse(promptText);
    });
  });

  // CTA to Step 5 (Dashboard & Xác Nhận)
  document.getElementById('btnExecuteAnalysis').addEventListener('click', () => {
    goToStep(5);
  });
}

function addUserChatMessage(text) {
  const container = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user-bubble';
  bubble.innerHTML = `
    <div class="bubble-avatar"><i class="fa-solid fa-user"></i></div>
    <div class="bubble-body">
      <strong>Bạn:</strong>
      <p>${text}</p>
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function addAiChatMessage(text) {
  const container = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ai-bubble';

  // Chuyển đổi định dạng Markdown sang HTML trang nhã
  let formatted = text
    .replace(/### (.*?)\n/g, '<h5 style="margin: 8px 0 4px 0; color: var(--primary); font-size: 1rem;">$1</h5>')
    .replace(/## (.*?)\n/g, '<h4 style="margin: 10px 0 4px 0; color: var(--primary); font-size: 1.1rem;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background: rgba(37,53,38,0.08); padding: 1px 5px; border-radius: 3px; font-family: monospace;">$1</code>')
    .replace(/\n\n/g, '</p><p style="margin-top: 8px;">')
    .replace(/\n/g, '<br>');

  bubble.innerHTML = `
    <div class="bubble-avatar"><i class="fa-solid fa-brain"></i></div>
    <div class="bubble-body">
      <strong>Quang Minh AI Copilot:</strong>
      <p>${formatted}</p>
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

async function handleAgentChatResponse(userMsg) {
  const lower = userMsg.toLowerCase().trim();

  // Kiểm tra nếu chưa có dữ liệu tệp
  if (!state.currentRows || state.currentRows.length === 0) {
    addAiChatMessage("Hệ thống chưa ghi nhận tệp dữ liệu nào! Bạn vui lòng tải lên hoặc kéo thả tệp CSV / Excel tại Bước 1 thì tôi mới có thể đọc bảng và giải đáp chính xác mọi con số cho bạn được nhé.");
    return;
  }

  if (!state.agreedQuestions.includes(userMsg) && userMsg.length > 8) {
    state.agreedQuestions.push(userMsg);
  }

  if (lower.includes('mục tiêu') || lower.includes('25%') || lower.includes('30%') || lower.includes('tăng trưởng')) {
    state.directives.targetGoal = '+25%';
  }
  if (lower.includes('rủi ro') || lower.includes('sụt giảm') || lower.includes('điểm nghẽn')) {
    state.directives.riskFocus = true;
  }

  // 1. GỌI GOOGLE GEMINI DUAL-BRAIN VỚI TOÀN BỘ CẤU TRÚC VÀ SỐ LIỆU THỰC TẾ TRONG BẢNG
  if (agentEngine.geminiApiKey) {
    const container = document.getElementById('chatMessages');
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai-bubble typing-bubble';
    typingBubble.innerHTML = `
      <div class="bubble-avatar"><i class="fa-solid fa-brain text-accent"></i></div>
      <div class="bubble-body">
        <strong>Quang Minh AI (Gemini Dual-Brain):</strong>
        <p><i class="fa-solid fa-spinner fa-spin"></i> Đang đọc hiểu toàn bộ bảng tính và tra cứu số liệu...</p>
      </div>
    `;
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;

    const datasetPrompt = agentEngine.buildDatasetContextPrompt(state.currentRows, state.profile);
    const prompt = `
DƯỚI ĐÂY LÀ CÂU HỎI CỦA NGƯỜI DÙNG VỀ BẢNG TÍNH:
"${userMsg}"

HÃY ĐỌC KỸ TOÀN BỘ CÁC DÒNG VÀ SỐ LIỆU TRONG BẢNG TÍNH DƯỚI ĐÂY ĐỂ TRẢ LỜI:
${datasetPrompt}

HƯỚNG DẪN TRẢ LỜI CHO NGƯỜI DÙNG:
1. Bạn PHẢI trả lời trực tiếp, rõ ràng và chuẩn xác 100% dựa trên các dòng dữ liệu thật trong bảng.
2. Nếu người dùng hỏi về bất kỳ con số, dòng, hoặc tháng/chi nhánh/sản phẩm cụ thể nào, hãy trích dẫn đúng con số từ bảng và nêu rõ dòng/tháng đó.
3. Nếu người dùng yêu cầu tính tổng, trung bình, so sánh hoặc tìm lớn nhất/nhỏ nhất, hãy thực hiện phép tính toán học chuẩn xác và nêu rõ kết quả.
4. Định dạng tiền tệ và số liệu rõ ràng theo chuẩn tiếng Việt (ví dụ: 450.000.000 VNĐ, 1.250 đơn hàng, 35,3%).
5. Trả lời bằng tiếng Việt chuyên nghiệp, ngắn gọn, súc tích và có tính hành động điều hành cao.
`;
    const systemPrompt = "Bạn là Quang Minh AI Data Copilot - trợ lý phân tích dữ liệu chuyên nghiệp. Bạn có năng lực đọc hiểu và tra cứu tường tận từng dòng, từng cột của bảng tính, trả lời chính xác mọi câu hỏi về số liệu của người dùng kèm dẫn chứng cụ thể.";

    try {
      const geminiReply = await agentEngine.callGeminiDualBrain(prompt, systemPrompt);
      if (typingBubble.parentNode) typingBubble.parentNode.removeChild(typingBubble);
      if (geminiReply && geminiReply.trim()) {
        addAiChatMessage(geminiReply.trim());
        return;
      }
    } catch (err) {
      console.warn('Gemini query error, using local data query engine:', err);
      if (typingBubble.parentNode) typingBubble.parentNode.removeChild(typingBubble);
    }
  }

  // 2. DỰ PHÒNG: ĐỘNG CƠ TRUY VẤN NỘI BỘ (LOCAL IN-MEMORY DATA ENGINE)
  const localReply = agentEngine.answerDataQueryLocally(userMsg, state.currentRows, state.profile);
  addAiChatMessage(localReply);
}

// =========================================================================
// 6. STEP 5: DASHBOARD & XÁC NHẬN
// =========================================================================
function renderStep5Dashboard() {
  if (!state.currentRows || state.currentRows.length === 0 || !state.profile) {
    return;
  }
  const kpis = agentEngine.calculateKPIs(state.currentRows, state.profile, state.context, state.directives);

  document.getElementById('kpiTitleStep5_1').textContent = kpis.kpi1.title;
  document.getElementById('kpiValueStep5_1').textContent = kpis.kpi1.value;
  document.getElementById('kpiBadgeStep5_1').className = `kpi-badge badge-${kpis.kpi1.status}`;
  document.getElementById('kpiBadgeStep5_1').textContent = kpis.kpi1.badge;
  document.getElementById('kpiSubtitleStep5_1').textContent = kpis.kpi1.subtitle;

  document.getElementById('kpiTitleStep5_2').textContent = kpis.kpi2.title;
  document.getElementById('kpiValueStep5_2').textContent = kpis.kpi2.value;
  document.getElementById('kpiBadgeStep5_2').className = `kpi-badge badge-${kpis.kpi2.status}`;
  document.getElementById('kpiBadgeStep5_2').textContent = kpis.kpi2.badge;
  document.getElementById('kpiSubtitleStep5_2').textContent = kpis.kpi2.subtitle;

  document.getElementById('kpiTitleStep5_3').textContent = kpis.kpi3.title;
  document.getElementById('kpiValueStep5_3').textContent = kpis.kpi3.value;
  document.getElementById('kpiBadgeStep5_3').className = `kpi-badge badge-${kpis.kpi3.status}`;
  document.getElementById('kpiBadgeStep5_3').textContent = kpis.kpi3.badge;
  document.getElementById('kpiSubtitleStep5_3').textContent = kpis.kpi3.subtitle;

  document.getElementById('kpiTitleStep5_4').textContent = kpis.kpi4.title;
  document.getElementById('kpiValueStep5_4').textContent = kpis.kpi4.value;
  document.getElementById('kpiBadgeStep5_4').className = `kpi-badge badge-${kpis.kpi4.status}`;
  document.getElementById('kpiBadgeStep5_4').textContent = kpis.kpi4.badge;
  document.getElementById('kpiSubtitleStep5_4').textContent = kpis.kpi4.subtitle;

  renderStep5Charts();
}

function renderStep5Charts() {
  const chartData = agentEngine.prepareChartData(state.currentRows, state.profile);
  const textColor = '#253526';
  const gridColor = 'rgba(37, 53, 38, 0.10)';

  if (state.charts.trendStep5) state.charts.trendStep5.destroy();
  if (state.charts.donutStep5) state.charts.donutStep5.destroy();

  const trendCtx = document.getElementById('trendChartCanvasStep5').getContext('2d');
  state.charts.trendStep5 = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: chartData.trend.labels,
      datasets: [
        {
          label: chartData.trend.primaryLabel,
          data: chartData.trend.primaryData,
          borderColor: '#344735',
          backgroundColor: 'rgba(52, 71, 53, 0.14)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#344735'
        },
        {
          label: chartData.trend.secondaryLabel,
          data: chartData.trend.secondaryData,
          borderColor: '#b86244',
          borderDash: [5, 5],
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#b86244'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', weight: '600' } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  const donutCtx = document.getElementById('donutChartCanvasStep5').getContext('2d');
  state.charts.donutStep5 = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: chartData.donut.labels,
      datasets: [{
        data: chartData.donut.data,
        backgroundColor: ['#344735', '#6b876c', '#b86244', '#c9933b', '#5f8087', '#8a5a44'],
        borderWidth: 2,
        borderColor: '#fdfcf9',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 12, weight: '600' } } } },
      cutout: '65%'
    }
  });
}

function initStep5DashboardHandlers() {
  const input = document.getElementById('refinementInputStep5');
  const btnApply = document.getElementById('btnApplyRefinementStep5');
  const btnGoStep6 = document.getElementById('btnConfirmAndGoToStep6');

  btnApply.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    if (text.toLowerCase().includes('loại trừ') || text.toLowerCase().includes('bỏ')) {
      state.directives.excludeGroup = text.replace(/loại trừ|bỏ/gi, '').trim();
    } else {
      state.directives.filterPeriod = text;
    }
    renderStep5Dashboard();
    alert(`Đã tính toán lại Dashboard theo chỉ thị: "${text}"!`);
  });

  btnGoStep6.addEventListener('click', () => {
    state.isReportConfirmed = true;
    goToStep(6);
  });
}

// =========================================================================
// 7. STEP 6: XUẤT BỘ BÁO CÁO & BỘ BIỂU ĐỒ TOÀN DIỆN CHI TIẾT
// =========================================================================
function renderStep6Report() {
  if (!state.currentRows || state.currentRows.length === 0 || !state.profile) {
    return;
  }
  const kpis = agentEngine.calculateKPIs(state.currentRows, state.profile, state.context, state.directives);

  // 1. Render 6 KPIs
  document.getElementById('kpiTitle1').textContent = kpis.kpi1.title;
  document.getElementById('kpiValue1').textContent = kpis.kpi1.value;
  document.getElementById('kpiBadge1').className = `kpi-badge badge-${kpis.kpi1.status}`;
  document.getElementById('kpiBadge1').textContent = kpis.kpi1.badge;
  document.getElementById('kpiSubtitle1').textContent = kpis.kpi1.subtitle;

  document.getElementById('kpiTitle2').textContent = kpis.kpi2.title;
  document.getElementById('kpiValue2').textContent = kpis.kpi2.value;
  document.getElementById('kpiBadge2').className = `kpi-badge badge-${kpis.kpi2.status}`;
  document.getElementById('kpiBadge2').textContent = kpis.kpi2.badge;
  document.getElementById('kpiSubtitle2').textContent = kpis.kpi2.subtitle;

  document.getElementById('kpiTitle3').textContent = kpis.kpi3.title;
  document.getElementById('kpiValue3').textContent = kpis.kpi3.value;
  document.getElementById('kpiBadge3').className = `kpi-badge badge-${kpis.kpi3.status}`;
  document.getElementById('kpiBadge3').textContent = kpis.kpi3.badge;
  document.getElementById('kpiSubtitle3').textContent = kpis.kpi3.subtitle;

  document.getElementById('kpiTitle4').textContent = kpis.kpi4.title;
  document.getElementById('kpiValue4').textContent = kpis.kpi4.value;
  document.getElementById('kpiBadge4').className = `kpi-badge badge-${kpis.kpi4.status}`;
  document.getElementById('kpiBadge4').textContent = kpis.kpi4.badge;
  document.getElementById('kpiSubtitle4').textContent = kpis.kpi4.subtitle;

  document.getElementById('kpiTitle5').textContent = kpis.kpi5.title;
  document.getElementById('kpiValue5').textContent = kpis.kpi5.value;
  document.getElementById('kpiBadge5').className = `kpi-badge badge-${kpis.kpi5.status}`;
  document.getElementById('kpiBadge5').textContent = kpis.kpi5.badge;
  document.getElementById('kpiSubtitle5').textContent = kpis.kpi5.subtitle;

  document.getElementById('kpiTitle6').textContent = kpis.kpi6.title;
  document.getElementById('kpiValue6').textContent = kpis.kpi6.value;
  document.getElementById('kpiBadge6').className = `kpi-badge badge-${kpis.kpi6.status}`;
  document.getElementById('kpiBadge6').textContent = kpis.kpi6.badge;
  document.getElementById('kpiSubtitle6').textContent = kpis.kpi6.subtitle;

  // 2. Render all 6 Charts
  renderStep6AllCharts();

  // 3. Render Detailed Scorecard Table
  renderScorecardTable(kpis);

  // 4. Render Targeted Evidence-based Q&A
  const qaContainer = document.getElementById('targetedQAContainer');
  const questionsToAnswer = state.agreedQuestions.length > 0 ? state.agreedQuestions.slice(0, 4) : [
    `Những phân nhóm nào đang là đầu tàu đóng góp ${state.profile.metrics[0]} cao nhất và chiếm bao nhiêu %?`,
    `Xu hướng biến động qua các chu kỳ gần nhất biến động ra sao?`,
    `Phân nhóm nào có kết quả thấp nhất cần tối ưu điểm nghẽn?`
  ];
  const qaAnswers = agentEngine.answerTargetedQuestions(questionsToAnswer, state.currentRows, state.profile, state.context, kpis, state.businessProblem);

  qaContainer.innerHTML = qaAnswers.map((item, idx) => `
    <div class="qa-row-item">
      <div class="qa-row-question">
        <i class="fa-solid fa-circle-question text-primary"></i>
        <span>Câu hỏi ${idx + 1}: ${item.question}</span>
      </div>
      <div class="qa-row-answer">${item.answer}</div>
      <div class="qa-row-evidence"><i class="fa-solid fa-database"></i> ${item.evidence}</div>
    </div>
  `).join('');

  // 5. Render Balanced 2-Column Executive Report & 30-60-90 Roadmap
  const report = agentEngine.generateExecutiveReport(state.currentRows, state.profile, state.context, kpis, qaAnswers, state.directives, state.businessProblem);
  document.getElementById('detailedReportContent').innerHTML = report.detailedHtml;
  document.getElementById('executiveBriefContent').innerHTML = report.briefHtml;
  document.getElementById('roadmapContainer').innerHTML = report.roadmapHtml;
}

function renderScorecardTable(kpis) {
  const tbody = document.getElementById('scorecardTableBody');
  const scorecardRows = agentEngine.buildScorecardRows(kpis, state.profile);

  tbody.innerHTML = scorecardRows.map(row => `
    <tr>
      <td style="font-weight: 700; color: #ffffff;">#${row.rank}</td>
      <td style="font-weight: 700; color: #ffffff;">${row.name}</td>
      <td style="color: #93c5fd; font-weight: 700;">${row.primaryFormatted}</td>
      <td style="color: #f3ca65;">${row.secondaryFormatted}</td>
      <td><span class="badge-tag">${row.share}</span></td>
      <td>${row.efficiency}</td>
      <td>${row.stars}</td>
    </tr>
  `).join('');
}

function renderStep6AllCharts() {
  const chartData = agentEngine.prepareChartData(state.currentRows, state.profile);
  const textColor = '#253526';
  const gridColor = 'rgba(37, 53, 38, 0.10)';

  if (state.charts.trend) state.charts.trend.destroy();
  if (state.charts.donut) state.charts.donut.destroy();
  if (state.charts.bar) state.charts.bar.destroy();
  if (state.charts.comparison) state.charts.comparison.destroy();
  if (state.charts.radar) state.charts.radar.destroy();
  if (state.charts.variance) state.charts.variance.destroy();

  // Chart 1: Dual-Axis Trendline & Area
  const trendCtx = document.getElementById('trendChartCanvas').getContext('2d');
  state.charts.trend = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: chartData.trend.labels,
      datasets: [
        {
          label: chartData.trend.primaryLabel,
          data: chartData.trend.primaryData,
          borderColor: '#344735',
          backgroundColor: 'rgba(52, 71, 53, 0.14)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#344735'
        },
        {
          label: chartData.trend.secondaryLabel,
          data: chartData.trend.secondaryData,
          borderColor: '#b86244',
          borderDash: [5, 5],
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#b86244'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', weight: '600' } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  // Chart 2: Donut Share
  const donutCtx = document.getElementById('donutChartCanvas').getContext('2d');
  state.charts.donut = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: chartData.donut.labels,
      datasets: [{
        data: chartData.donut.data,
        backgroundColor: ['#344735', '#6b876c', '#b86244', '#c9933b', '#5f8087', '#8a5a44'],
        borderWidth: 2,
        borderColor: '#fdfcf9',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 12, weight: '600' } } } },
      cutout: '65%'
    }
  });

  // Chart 3: Horizontal Ranking Bar
  const barCtx = document.getElementById('barChartCanvas').getContext('2d');
  state.charts.bar = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: chartData.bar.labels,
      datasets: [{
        label: state.profile.metrics[0],
        data: chartData.bar.data,
        backgroundColor: '#435b44',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', weight: '600' } } }
      }
    }
  });

  // Chart 4: Grouped Comparison Bar
  const compCtx = document.getElementById('comparisonChartCanvas').getContext('2d');
  state.charts.comparison = new Chart(compCtx, {
    type: 'bar',
    data: {
      labels: chartData.comparison.labels,
      datasets: [
        {
          label: chartData.comparison.primaryLabel,
          data: chartData.comparison.primaryData,
          backgroundColor: '#344735',
          borderRadius: 4
        },
        {
          label: chartData.comparison.secondaryLabel,
          data: chartData.comparison.secondaryData,
          backgroundColor: '#b86244',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', weight: '600' } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  // Chart 5: Radar / Polar Multi-Dimensional Assessment
  const radarCtx = document.getElementById('radarChartCanvas').getContext('2d');
  state.charts.radar = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: chartData.radar.labels,
      datasets: [{
        label: 'Chỉ Số Năng Lực Toàn Diện',
        data: chartData.radar.data,
        backgroundColor: 'rgba(52, 71, 53, 0.22)',
        borderColor: '#344735',
        pointBackgroundColor: '#b86244',
        pointBorderColor: '#344735',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          angleLines: { color: gridColor },
          grid: { color: gridColor },
          pointLabels: { color: textColor, font: { family: 'Inter', weight: '700' } },
          ticks: { display: false }
        }
      }
    }
  });

  // Chart 6: Variance & Risk Breakdown Bar
  const varCtx = document.getElementById('varianceChartCanvas').getContext('2d');
  state.charts.variance = new Chart(varCtx, {
    type: 'bar',
    data: {
      labels: chartData.variance.labels,
      datasets: [{
        label: 'Tỷ Trọng Đóng Góp (%)',
        data: chartData.variance.data,
        backgroundColor: ['#435b44', '#6b876c', '#b86244', '#c9933b', '#5f8087', '#8a5a44'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });
}

function initStep6ReportHandlers() {
  const input = document.getElementById('refinementInput');
  const btnApply = document.getElementById('btnApplyRefinement');

  btnApply.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    if (text.toLowerCase().includes('loại trừ') || text.toLowerCase().includes('bỏ')) {
      state.directives.excludeGroup = text.replace(/loại trừ|bỏ/gi, '').trim();
    } else {
      state.directives.filterPeriod = text;
    }
    renderStep6Report();
    alert(`Đã tính toán lại toàn bộ Báo cáo và 6 Biểu đồ theo chỉ thị: "${text}"!`);
  });
}

// =========================================================================
// 8. EXECUTIVE EXPORT SUITE (STANDALONE HTML EXPORT)
// =========================================================================
function initExecutiveExportSuite() {
  const triggerExport = () => {
    if (!state.currentRows || state.currentRows.length === 0) {
      alert('Chưa có dữ liệu để xuất báo cáo! Vui lòng tải lên tệp Excel hoặc CSV tại Bước 1 trước.');
      goToStep(1);
      return;
    }
    if (state.currentStep !== 6) goToStep(6);
    downloadStandaloneHtmlReport();
  };

  document.getElementById('btnTopExport').addEventListener('click', triggerExport);
  document.getElementById('btnDownloadHtmlReport').addEventListener('click', triggerExport);
  document.getElementById('btnDownloadHtmlReportBottom').addEventListener('click', triggerExport);
}

function downloadStandaloneHtmlReport() {
  const kpis = agentEngine.calculateKPIs(state.currentRows, state.profile, state.context, state.directives);
  const scorecardRows = agentEngine.buildScorecardRows(kpis, state.profile);
  const qaContainer = document.getElementById('targetedQAContainer').innerHTML;
  const detailedHtml = document.getElementById('detailedReportContent').innerHTML;
  const briefHtml = document.getElementById('executiveBriefContent').innerHTML;
  const roadmapHtml = document.getElementById('roadmapContainer').innerHTML;

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Doanh Nghiệp Toàn Diện — Quang Minh AI Data Analyst</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #3c5466; color: #f8fafc; margin: 0; padding: 2.5rem 1.5rem; line-height: 1.6; }
    .container { max-width: 1250px; margin: 0 auto; background: #4a667c; padding: 2.5rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
    h1, h2, h3, h4 { color: #f8fafc; margin-top: 0; }
    .header-bar { border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 1.25rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand-title { font-size: 1.85rem; font-weight: 800; color: #ffffff; }
    .meta-date { font-size: 0.9rem; color: #e2e8f0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .kpi-tile { background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); }
    .kpi-label { font-size: 0.775rem; color: #dbeafe; font-weight: 600; }
    .kpi-val { font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0; }
    .kpi-sub { font-size: 0.725rem; color: #cbd5e1; }
    .section-title { font-size: 1.2rem; font-weight: 800; border-left: 4px solid #ffffff; padding-left: 0.75rem; margin: 2rem 0 1rem; color: #ffffff; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.15); border-radius: 8px; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.15); }
    th { background: rgba(0,0,0,0.25); color: #ffffff; font-weight: 700; }
    .two-col-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.5rem; margin-top: 1.5rem; }
    .col-box { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); }
    .brief-item { padding: 0.85rem 1rem; margin-bottom: 0.75rem; border-radius: 8px; font-size: 0.9rem; }
    .brief-item.plus { background: rgba(120, 192, 136, 0.25); border-left: 4px solid #78c088; color: #ffffff; }
    .brief-item.minus { background: rgba(240, 138, 93, 0.25); border-left: 4px solid #f08a5d; color: #ffffff; }
    .roadmap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 1rem; }
    .roadmap-col { background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); }
    .footer { text-align: center; margin-top: 3rem; font-size: 0.85rem; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1.5rem; }
    @media print { body { background: white; color: black; padding: 0; } .container { border: none; box-shadow: none; background: white; color: black; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div>
        <div class="brand-title">QUANG MINH AI DATA ANALYST</div>
        <div style="color: #e2e8f0; font-size: 0.95rem;">Bộ Báo Cáo Phân Tích Dữ Liệu Doanh Nghiệp Toàn Diện</div>
      </div>
      <div class="meta-date">Thời gian xuất bản: ${new Date().toLocaleString('vi-VN')}</div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-tile">
        <div class="kpi-label">${kpis.kpi1.title}</div>
        <div class="kpi-val">${kpis.kpi1.value}</div>
        <div class="kpi-sub">${kpis.kpi1.subtitle}</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">${kpis.kpi2.title}</div>
        <div class="kpi-val">${kpis.kpi2.value}</div>
        <div class="kpi-sub">${kpis.kpi2.subtitle}</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">${kpis.kpi3.title}</div>
        <div class="kpi-val">${kpis.kpi3.value}</div>
        <div class="kpi-sub">${kpis.kpi3.subtitle}</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">${kpis.kpi4.title}</div>
        <div class="kpi-val">${kpis.kpi4.value}</div>
        <div class="kpi-sub">${kpis.kpi4.subtitle}</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">${kpis.kpi5.title}</div>
        <div class="kpi-val">${kpis.kpi5.value}</div>
        <div class="kpi-sub">${kpis.kpi5.subtitle}</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">${kpis.kpi6.title}</div>
        <div class="kpi-val">${kpis.kpi6.value}</div>
        <div class="kpi-sub">${kpis.kpi6.subtitle}</div>
      </div>
    </div>

    <div class="section-title">I. BẢNG PHÂN TÍCH HIỆU SUẤT TỪNG PHÂN NHÓM (SCORECARD)</div>
    <table>
      <thead>
        <tr>
          <th>Hạng</th>
          <th>Tên Phân Nhóm</th>
          <th>Chỉ Số Chính</th>
          <th>Chỉ Số Phụ</th>
          <th>Tỷ Trọng %</th>
          <th>Tỷ Suất %</th>
          <th>Đánh Giá Xếp Hạng</th>
        </tr>
      </thead>
      <tbody>
        ${scorecardRows.map(r => `
          <tr>
            <td>#${r.rank}</td>
            <td><strong>${r.name}</strong></td>
            <td>${r.primaryFormatted}</td>
            <td>${r.secondaryFormatted}</td>
            <td>${r.share}</td>
            <td>${r.efficiency}</td>
            <td>${r.stars}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">II. GIẢI ĐÁP TRỌNG TÂM NGHIỆP VỤ (TARGETED EVIDENCE-BASED Q&A)</div>
    <div>${qaContainer}</div>

    <div class="section-title">III. BÁO CÁO TOÀN CẢNH & TÓM TẮT ĐIỀU HÀNH</div>
    <div class="two-col-grid">
      <div class="col-box">
        <h3 style="color: #ffffff;">Báo Cáo Phân Tích Kinh Doanh Chi Tiết</h3>
        <div>${detailedHtml}</div>
      </div>
      <div class="col-box">
        <h3 style="color: #f3ca65;">Tóm Tắt Dành Cho Ban Giám Đốc</h3>
        <div>${briefHtml}</div>
      </div>
    </div>

    <div class="section-title">IV. LỘ TRÌNH HÀNH ĐỘNG CHIẾN LƯỢC 30 — 60 — 90 NGÀY</div>
    <div class="roadmap-grid">${roadmapHtml}</div>

    <div class="footer">
      Báo cáo được khởi tạo tự động bởi <strong>Quang Minh AI Data Analyst — Enterprise Analytics Suite</strong><br>
      © 2026 Quang Minh Analytics. Toàn bộ quyền được bảo lưu. 100% Số liệu được đối chiếu thực chứng.
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Quang_Minh_AI_Data_Analyst_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =========================================================================
// 9. DUAL-BRAIN GEMINI CONFIG MODAL
// =========================================================================
function initDualBrainModal() {
  const modal = document.getElementById('apiModalOverlay');
  const btnOpen = document.getElementById('btnOpenApiModal');
  const btnClose = document.getElementById('btnCloseApiModal');
  const btnSave = document.getElementById('btnSaveApiKey');
  const inputKey = document.getElementById('geminiApiKey');
  const selectModel = document.getElementById('geminiModelSelect');

  const updateDualBrainIndicator = () => {
    if (agentEngine.geminiApiKey) {
      btnOpen.innerHTML = '<i class="fa-solid fa-brain text-accent"></i> Dual-Brain <span class="badge-tag badge-success" style="padding: 1px 6px; font-size: 10px; margin-left: 2px;">Active</span>';
    } else {
      btnOpen.innerHTML = '<i class="fa-solid fa-brain"></i> Dual-Brain';
    }
  };
  updateDualBrainIndicator();

  btnOpen.addEventListener('click', () => {
    inputKey.value = agentEngine.geminiApiKey;
    selectModel.value = agentEngine.geminiModel;
    modal.classList.add('active');
  });

  btnClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  btnSave.addEventListener('click', () => {
    agentEngine.setApiKey(inputKey.value, selectModel.value);
    updateDualBrainIndicator();
    modal.classList.remove('active');
    alert('Đã kích hoạt thành công cấu hình Dual-Brain của Quang Minh AI!');
  });
}

// =========================================================================
// 10. USER GUIDE MODAL (CẨM NANG HƯỚNG DẪN SỬ DỤNG - LOGO MU CHUYỂN ĐỘNG)
// =========================================================================
function initGuideModal() {
  const modal = document.getElementById('guideModalOverlay');
  const btnFloating = document.getElementById('btnOpenGuideModal');
  const muBadgeFloating = document.getElementById('muBadgeFloating');
  const muModalBadge = document.getElementById('muModalBadge');
  const btnHeader = document.getElementById('btnHeaderGuide');
  const btnClose = document.getElementById('btnCloseGuideModal');
  const btnCloseBottom = document.getElementById('btnCloseGuideModalBottom');

  let isAnimating = false;

  const triggerMuMotion = (targetEl, callback) => {
    if (!targetEl) {
      if (callback) callback();
      return;
    }
    targetEl.classList.remove('mu-spin-anim');
    // Force reflow
    void targetEl.offsetWidth;
    targetEl.classList.add('mu-spin-anim');

    if (btnFloating) {
      btnFloating.classList.remove('mu-btn-clicked');
      void btnFloating.offsetWidth;
      btnFloating.classList.add('mu-btn-clicked');
    }

    setTimeout(() => {
      if (callback) callback();
    }, 280);

    setTimeout(() => {
      targetEl.classList.remove('mu-spin-anim');
      if (btnFloating) btnFloating.classList.remove('mu-btn-clicked');
      isAnimating = false;
    }, 750);
  };

  const openModal = () => {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (btnFloating) {
    btnFloating.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAnimating) return;
      isAnimating = true;
      triggerMuMotion(muBadgeFloating, openModal);
    });
  }

  // Interactive Easter Egg: Click MU logo inside modal to spin again
  if (muModalBadge) {
    muModalBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerMuMotion(muModalBadge);
    });
  }

  if (btnHeader) {
    btnHeader.addEventListener('click', () => {
      const iconSm = btnHeader.querySelector('.mu-logo-icon-sm');
      if (iconSm) {
        iconSm.style.transform = 'rotate(720deg) scale(1.2)';
        setTimeout(() => {
          iconSm.style.transform = '';
        }, 500);
      }
      openModal();
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCloseBottom) btnCloseBottom.addEventListener('click', closeModal);

  // Close when clicking on backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// =========================================================================
// 11. MANCHESTER UNITED CURSOR EFFECT (HIỆU ỨNG DI CHUỘT HÌNH MU)
// =========================================================================
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const muCursor = document.getElementById('cursorMu') || document.getElementById('cursorRing');
  const muBadge = document.getElementById('cursorMuBadge');
  if (!dot || !muCursor) return;

  // Không áp dụng trên màn hình cảm ứng điện thoại
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100;
  let muX = -100, muY = -100;
  let prevMuX = -100;
  let isInitialized = false;
  let currentTilt = 0;
  let lastSparkleTime = 0;

  const renderLoop = () => {
    if (isInitialized) {
      // Easing mượt mà (lerp 0.18) trôi êm ái theo con trỏ chuột
      const dx = mouseX - muX;
      const dy = mouseY - muY;
      muX += dx * 0.18;
      muY += dy * 0.18;

      // Tính góc nghiêng động (velocity tilt) theo chiều di chuyển
      const speedX = muX - prevMuX;
      prevMuX = muX;
      const targetTilt = Math.max(-28, Math.min(28, speedX * 1.5));
      currentTilt += (targetTilt - currentTilt) * 0.2;

      muCursor.style.left = `${muX}px`;
      muCursor.style.top = `${muY}px`;

      if (muBadge && !muCursor.classList.contains('hovering')) {
        muBadge.style.transform = `rotate(${currentTilt.toFixed(1)}deg)`;
      }

      // Khi di chuyển nhanh, tạo vệt hào quang vàng/đỏ lấp lánh (throttled 70ms)
      const now = performance.now();
      const velocity = Math.hypot(dx, dy);
      if (velocity > 12 && now - lastSparkleTime > 75) {
        lastSparkleTime = now;
        createCursorSparkle(muX, muY);
      }
    }
    requestAnimationFrame(renderLoop);
  };
  requestAnimationFrame(renderLoop);

  const createCursorSparkle = (x, y) => {
    const sparkle = document.createElement('div');
    sparkle.className = 'mu-cursor-sparkle';
    sparkle.style.left = `${x + (Math.random() * 12 - 6)}px`;
    sparkle.style.top = `${y + (Math.random() * 12 - 6)}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 500);
  };

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;

    if (!isInitialized) {
      muX = mouseX;
      muY = mouseY;
      prevMuX = mouseX;
      dot.classList.add('active');
      muCursor.classList.add('active');
      isInitialized = true;
    }
  });

  window.addEventListener('mouseenter', () => {
    if (isInitialized) {
      dot.classList.add('active');
      muCursor.classList.add('active');
    }
  });

  window.addEventListener('mouseleave', () => {
    dot.classList.remove('active');
    muCursor.classList.remove('active');
  });

  // Tương tác khi di chuột qua các nút, liên kết, thẻ và ô nhập liệu
  const interactiveSelector = 'button, a, .step-pill, .tab-btn, .option-card, .preset-btn, .btn, input, select, textarea, .qa-row-item, .kpi-card, .chart-card, .guide-step-card, [role="button"], label, .dropzone, .mu-badge-container';

  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      muCursor.classList.add('hovering');
      dot.classList.add('hovering');
      if (muBadge) muBadge.style.transform = '';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      muCursor.classList.remove('hovering');
      dot.classList.remove('hovering');
    }
  });

  // Hiệu ứng sóng gợn năng lượng Manchester khi nhấn chuột
  window.addEventListener('mousedown', (e) => {
    muCursor.classList.add('clicking');
    dot.classList.add('clicking');

    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple-mu';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 600);
  });

  window.addEventListener('mouseup', () => {
    muCursor.classList.remove('clicking');
    dot.classList.remove('clicking');
  });
}

// =========================================================================
// 12. AMBIENT BOTANICAL PARTICLES (ĐỐM SÁNG & BÓNG LÁ THIÊN NHIÊN ĐỘNG)
// =========================================================================
function initAmbientParticles() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = 22;
  const particles = [];
  const palette = [
    'rgba(107, 135, 108, 0.24)', // Soft Sage
    'rgba(67, 91, 68, 0.18)',    // Forest Olive
    'rgba(244, 239, 230, 0.35)', // Sunlight Ivory
    'rgba(201, 147, 59, 0.16)'   // Harvest Warmth
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1.2,
      color: palette[Math.floor(Math.random() * palette.length)],
      vy: Math.random() * 0.32 + 0.14,
      swaySpeed: Math.random() * 0.012 + 0.006,
      swayAmplitude: Math.random() * 1.8 + 0.8,
      phase: Math.random() * Math.PI * 2
    });
  }

  let time = 0;
  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    time += 0.02;

    for (let p of particles) {
      p.y -= p.vy;
      p.x += Math.sin(time * p.swaySpeed + p.phase) * (p.swayAmplitude * 0.5);

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
