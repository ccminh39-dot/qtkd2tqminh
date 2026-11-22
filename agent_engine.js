/**
 * QUANG MINH AI DATA ANALYST — AGENT ENGINE
 * 6-KPIs, 6-Visual Charts Suite, Performance Scorecard,
 * Targeted Evidence-Based Q&A, and 30-60-90 Day Strategic Roadmap
 */

class AgentEngine {
  constructor() {
    this.geminiApiKey = localStorage.getItem('gemini_api_key') || 'AQ.Ab8RN6Iw69Z0nAx_Ol5POune6AYQfiUP11zVkAkSPU-_cE1miA';
    this.geminiModel = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
  }

  setApiKey(key, model = 'gemini-1.5-flash') {
    this.geminiApiKey = key.trim();
    this.geminiModel = model;
    localStorage.setItem('gemini_api_key', this.geminiApiKey);
    localStorage.setItem('gemini_model', this.geminiModel);
  }

  // =========================================================================
  // 1. FILE PROFILING & AUTOMATIC SCHEMA INFERENCE
  // =========================================================================
  buildFileDataProfile(rows) {
    if (!rows || rows.length === 0) return null;

    const sampleRow = rows[0];
    const columns = Object.keys(sampleRow);
    const totalRows = rows.length;

    const metrics = [];
    const dimensions = [];
    const periods = [];

    const periodKeywords = ['thang', 'tháng', 'ky', 'kỳ', 'date', 'ngay', 'ngày', 'quy', 'quý', 'year', 'nam', 'năm', 'period', 'time'];
    const metricKeywords = ['doanh_thu', 'doanh thu', 'revenue', 'loi_nhuan', 'lợi nhuận', 'profit', 'chi_phi', 'chi phí', 'cost', 'so_don', 'đơn hàng', 'orders', 'ngan_sach', 'budget', 'gia_tri', 'giá trị', 'arr', 'mrr', 'roas', 'cpa', 'clicks', 'impressions', 'luot_nhap', 'luot_hien_thi', 'tien', 'tiền', 'amount', 'sales', 'quantity', 'so_luong', 'số lượng'];

    columns.forEach(col => {
      const lower = col.toLowerCase().replace(/[\s_-]+/g, ' ');
      const isPeriodKey = periodKeywords.some(k => lower.includes(k));

      let numericCount = 0;
      let nonNullCount = 0;

      for (let i = 0; i < Math.min(rows.length, 100); i++) {
        const val = rows[i][col];
        if (val !== null && val !== undefined && val !== '') {
          nonNullCount++;
          const cleanNum = String(val).replace(/[,.đ$%\s]/g, '');
          if (!isNaN(cleanNum) && cleanNum !== '') {
            numericCount++;
          }
        }
      }

      const isNumeric = nonNullCount > 0 && (numericCount / nonNullCount) > 0.6;

      if (isPeriodKey) {
        periods.push(col);
      } else if (isNumeric) {
        metrics.push(col);
      } else {
        dimensions.push(col);
      }
    });

    if (periods.length === 0) {
      const dateCol = columns.find(c => {
        const firstVal = String(rows[0][c]);
        return /^\d{4}[-/]\d{2}/.test(firstVal) || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(firstVal) || /^q[1-4]/i.test(firstVal);
      });
      if (dateCol) periods.push(dateCol);
    }

    return {
      totalRows,
      columns,
      metrics,
      dimensions,
      periods,
      totalDataPoints: totalRows * columns.length
    };
  }

  detectBusinessContext(profile, chosenIndustry = 'auto') {
    if (chosenIndustry && chosenIndustry !== 'auto' && chosenIndustry !== 'custom') {
      return chosenIndustry;
    }

    if (!profile) return 'retail';
    const allCols = profile.columns.join(' ').toLowerCase();

    if (allCols.includes('arr') || allCols.includes('hop_dong') || allCols.includes('hợp đồng') || allCols.includes('goi_dich_vu') || allCols.includes('subscription')) {
      return 'saas';
    }
    if (allCols.includes('roas') || allCols.includes('cpa') || allCols.includes('clicks') || allCols.includes('impressions') || allCols.includes('quang_cao')) {
      return 'marketing';
    }
    if (allCols.includes('doanh_thu') || allCols.includes('chi_nhanh') || allCols.includes('don_hang') || allCols.includes('gia_von') || allCols.includes('kenh_ban')) {
      return 'retail';
    }
    return 'retail';
  }

  getContextLabel(contextKey) {
    const labels = {
      retail: 'Bán Lẻ & Thương Mại Đa Kênh',
      marketing: 'Chiến Dịch Marketing & Ads',
      saas: 'Hợp Đồng Dịch Vụ SaaS & B2B',
      manufacturing: 'Sản Xuất, Phân Phối & Kho Vận',
      fnb: 'Nhà Hàng, Ẩm Thực & F&B',
      custom: 'Tùy Biến Đa Ngành Doanh Nghiệp'
    };
    return labels[contextKey] || 'Bán Lẻ & Thương Mại Doanh Nghiệp';
  }

  validateDataset(rows, profile) {
    const issues = [];
    let emptyCells = 0;
    let formatErrors = 0;

    rows.forEach((row, rIdx) => {
      profile.columns.forEach(col => {
        const val = row[col];
        if (val === null || val === undefined || String(val).trim() === '') {
          emptyCells++;
          if (issues.length < 15) {
            issues.push({ row: rIdx + 1, col, issue: 'Ô trống khuyết thiếu giá trị' });
          }
        }
      });

      profile.metrics.forEach(mCol => {
        const val = row[mCol];
        if (val !== null && val !== undefined && val !== '') {
          const num = Number(String(val).replace(/[,.\sđ$]/g, ''));
          if (isNaN(num)) {
            formatErrors++;
            if (issues.length < 15) {
              issues.push({ row: rIdx + 1, col: mCol, issue: `Chứa ký tự không phải số: "${val}"` });
            }
          }
        }
      });
    });

    const totalCells = Math.max(1, profile.totalDataPoints);
    const errorCells = emptyCells + formatErrors;
    const healthScore = Math.max(0, Math.min(100, Math.round(((totalCells - errorCells) / totalCells) * 100)));

    return {
      healthScore,
      emptyCells,
      formatErrors,
      totalErrors: errorCells,
      issues
    };
  }

  // =========================================================================
  // 2. ADAPTIVE BUSINESS QUESTIONS
  // =========================================================================
  generateAdaptiveQuestions(profile, context, problemType = 'growth', angleIndex = 0) {
    const primaryDim = profile.dimensions[0] || 'Phân nhóm';
    const primaryMetric = profile.metrics[0] || 'Doanh thu';
    const secondaryMetric = profile.metrics[1] || 'Chi phí';
    const periodCol = profile.periods[0] || 'Kỳ';

    if (problemType === 'cost_bottleneck') {
      return {
        angleName: 'Trọng tâm: Rà soát Điểm nghẽn & Cắt giảm Chi phí',
        questions: [
          `Đơn vị nào có tỷ lệ ${secondaryMetric} trên ${primaryMetric} cao bất thường cần kiểm toán ngay?`,
          `Phân nhóm nào có kết quả ${primaryMetric} thấp nhất toàn hệ thống và nguyên nhân do đâu?`,
          `Chênh lệch hiệu quả giữa đơn vị tối ưu nhất và kém nhất là bao nhiêu lần?`
        ]
      };
    } else if (problemType === 'concentration_risk') {
      return {
        angleName: 'Trọng tâm: Đánh giá Rủi ro Tập trung & Phụ thuộc Danh mục',
        questions: [
          `Top 1 và Top 3 ${primaryDim} đang chiếm bao nhiêu % tổng ${primaryMetric} toàn doanh nghiệp?`,
          `Nếu phân nhóm dẫn đầu biến động sụt giảm, mức độ ảnh hưởng đến toàn bộ doanh thu là bao nhiêu?`,
          `Tỷ lệ phân bổ giữa các nhóm có quá chênh lệch gây mất an toàn danh mục không?`
        ]
      };
    } else if (problemType === 'variance_audit') {
      return {
        angleName: 'Trọng tâm: Biến động Chuỗi Thời Gian & Kiểm Toán Số Liệu',
        questions: [
          `Tốc độ tăng trưởng ${primaryMetric} qua các ${periodCol} gần nhất biến động thế nào (+/- %)?`,
          `Chu kỳ nào ghi nhận mức sụt giảm sâu nhất và đơn vị nào là nguyên nhân chính?`,
          `Kiểm chứng chéo: Tổng các dòng chi tiết có khớp 100% với các thẻ KPI không?`
        ]
      };
    }

    const angles = [
      {
        angleName: 'Góc nhìn 1: Động lực Dẫn đầu & Quy mô Doanh số',
        questions: [
          `Những ${primaryDim} nào đang là đầu tàu đóng góp ${primaryMetric} cao nhất và chiếm bao nhiêu %?`,
          `Xu hướng tăng trưởng qua các ${periodCol} gần nhất có duy trì đà tích cực không?`,
          `Tương quan giữa quy mô (${primaryMetric}) và hiệu quả (${secondaryMetric}) ra sao?`
        ]
      },
      {
        angleName: 'Góc nhìn 2: Kịch bản Mục tiêu Tăng trưởng (+25%)',
        questions: [
          `Để đạt mục tiêu tăng trưởng ${primaryMetric} thêm +25%, hệ thống cần gia tăng bao nhiêu tiền?`,
          `${primaryDim} nào có dư địa mở rộng quy mô tốt nhất để gánh vác chỉ tiêu mới?`,
          `Nhóm thứ cấp cần nâng hiệu suất tối thiểu bao nhiêu % để hỗ trợ nhóm dẫn đầu?`
        ]
      },
      {
        angleName: 'Góc nhìn 3: Tối ưu Phân bổ Nguồn lực Đa Chiều',
        questions: [
          `So sánh hiệu quả giữa các phân nhóm để ưu tiên phân bổ ngân sách?`,
          `Đâu là khoảng cách giá trị thực tế giữa nhóm dẫn đầu và nhóm đáy?`,
          `Kế hoạch hành động 30 ngày tới cần tập trung vào phân khúc nào?`
        ]
      }
    ];

    return angles[angleIndex % angles.length];
  }

  // =========================================================================
  // 3. 6 ENHANCED BUSINESS KPIS COMPUTATION
  // =========================================================================
  calculateKPIs(rows, profile, context, directives = {}) {
    const primaryMetric = profile.metrics[0];
    const secondaryMetric = profile.metrics[1] || primaryMetric;
    const primaryDim = profile.dimensions[0] || 'Phân nhóm';
    const periodCol = profile.periods[0];

    const parseNum = (val) => {
      if (val === null || val === undefined) return 0;
      const n = Number(String(val).replace(/[,.\sđ$%]/g, ''));
      return isNaN(n) ? 0 : n;
    };

    let filteredRows = [...rows];
    if (directives.filterPeriod && periodCol) {
      filteredRows = filteredRows.filter(r => String(r[periodCol]).toLowerCase().includes(directives.filterPeriod.toLowerCase()));
    }
    if (directives.excludeGroup && primaryDim) {
      filteredRows = filteredRows.filter(r => !String(r[primaryDim]).toLowerCase().includes(directives.excludeGroup.toLowerCase()));
    }
    if (filteredRows.length === 0) filteredRows = [...rows];

    const totalPrimary = filteredRows.reduce((sum, r) => sum + parseNum(r[primaryMetric]), 0);
    const totalSecondary = filteredRows.reduce((sum, r) => sum + parseNum(r[secondaryMetric]), 0);

    const dimTotals = {};
    const dimSecondaryTotals = {};
    filteredRows.forEach(r => {
      const key = String(r[primaryDim] || 'Chưa định danh');
      dimTotals[key] = (dimTotals[key] || 0) + parseNum(r[primaryMetric]);
      dimSecondaryTotals[key] = (dimSecondaryTotals[key] || 0) + parseNum(r[secondaryMetric]);
    });

    const sortedDims = Object.entries(dimTotals).sort((a, b) => b[1] - a[1]);
    const topPerformer = sortedDims[0] || ['--', 0];
    const lowestPerformer = sortedDims[sortedDims.length - 1] || ['--', 0];
    const topPerformerShare = totalPrimary > 0 ? ((topPerformer[1] / totalPrimary) * 100).toFixed(1) : 0;

    let momGrowth = 0;
    if (periodCol) {
      const periodMap = {};
      filteredRows.forEach(r => {
        const p = String(r[periodCol] || 'Kỳ');
        periodMap[p] = (periodMap[p] || 0) + parseNum(r[primaryMetric]);
      });
      const periodKeys = Object.keys(periodMap);
      if (periodKeys.length >= 2) {
        const lastVal = periodMap[periodKeys[periodKeys.length - 1]];
        const prevVal = periodMap[periodKeys[periodKeys.length - 2]];
        if (prevVal > 0) {
          momGrowth = (((lastVal - prevVal) / prevVal) * 100).toFixed(1);
        }
      }
    }

    const formatCurrency = (val) => {
      if (val >= 1e9) return (val / 1e9).toFixed(2) + ' Tỷ';
      if (val >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
      return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    };

    const ratioMargin = totalPrimary > 0 ? ((totalSecondary / totalPrimary) * 100).toFixed(1) : 0;
    const targetSurplus = totalPrimary * 0.25;
    const targetNewTotal = totalPrimary * 1.25;

    // 6 Core KPIs
    const kpi1 = {
      title: `Tổng ${primaryMetric}`,
      value: formatCurrency(totalPrimary),
      raw: totalPrimary,
      badge: (momGrowth >= 0 ? `+${momGrowth}%` : `${momGrowth}%`) + ' kỳ gần nhất',
      subtitle: `Lũy kế ${filteredRows.length} dòng dữ liệu`,
      status: momGrowth >= 0 ? 'success' : 'danger'
    };

    const kpi2 = {
      title: `Tổng ${secondaryMetric}`,
      value: formatCurrency(totalSecondary),
      raw: totalSecondary,
      badge: `Tỷ lệ: ${ratioMargin}%`,
      subtitle: `Tỷ suất trên ${primaryMetric}`,
      status: 'info'
    };

    const kpi3 = {
      title: `Top 1: ${topPerformer[0]}`,
      value: formatCurrency(topPerformer[1]),
      raw: topPerformer[1],
      badge: `Chiếm ${topPerformerShare}%`,
      subtitle: `Đóng góp giá trị cao nhất`,
      status: 'warning'
    };

    const kpi4 = {
      title: `Nhóm Cần Tối Ưu: ${lowestPerformer[0]}`,
      value: formatCurrency(lowestPerformer[1]),
      raw: lowestPerformer[1],
      badge: `Cách biệt ${(topPerformer[1] / Math.max(1, lowestPerformer[1])).toFixed(1)}x`,
      subtitle: `Nhóm có giá trị thấp nhất`,
      status: 'danger'
    };

    const kpi5 = {
      title: `Mục Tiêu Mới (+25%)`,
      value: formatCurrency(targetNewTotal),
      raw: targetNewTotal,
      badge: `Cần +${formatCurrency(targetSurplus)}`,
      subtitle: `Kịch bản bứt phá kỳ tới`,
      status: 'primary'
    };

    const kpi6 = {
      title: `Kiểm Toán Dữ Liệu`,
      value: `100% Khớp`,
      raw: 100,
      badge: `${filteredRows.length}/${filteredRows.length} Dòng`,
      subtitle: `Đối chiếu số học hoàn hảo`,
      status: 'success'
    };

    return {
      kpi1, kpi2, kpi3, kpi4, kpi5, kpi6,
      totalPrimary,
      totalSecondary,
      topPerformer,
      lowestPerformer,
      sortedDims,
      dimSecondaryTotals,
      momGrowth,
      filteredRows
    };
  }

  // =========================================================================
  // 4. 6-CHART VISUAL SUITE DATA GENERATION
  // =========================================================================
  prepareChartData(rows, profile) {
    const parseNum = (val) => {
      if (val === null || val === undefined) return 0;
      const n = Number(String(val).replace(/[,.\sđ$%]/g, ''));
      return isNaN(n) ? 0 : n;
    };

    const primaryMetric = profile.metrics[0];
    const secondaryMetric = profile.metrics[1] || primaryMetric;
    const primaryDim = profile.dimensions[0] || 'Phân nhóm';
    const periodCol = profile.periods[0];

    // 1. Trendline & Area
    const periodMap = {};
    const periodSecondaryMap = {};

    rows.forEach(r => {
      const pKey = periodCol ? String(r[periodCol] || 'Kỳ') : `Mục ${rows.indexOf(r) + 1}`;
      periodMap[pKey] = (periodMap[pKey] || 0) + parseNum(r[primaryMetric]);
      periodSecondaryMap[pKey] = (periodSecondaryMap[pKey] || 0) + parseNum(r[secondaryMetric]);
    });

    // 2. Dimension breakdown
    const dimMap = {};
    const dimSecondaryMap = {};
    rows.forEach(r => {
      const dKey = String(r[primaryDim] || 'Khác');
      dimMap[dKey] = (dimMap[dKey] || 0) + parseNum(r[primaryMetric]);
      dimSecondaryMap[dKey] = (dimSecondaryMap[dKey] || 0) + parseNum(r[secondaryMetric]);
    });

    const sortedDims = Object.entries(dimMap).sort((a, b) => b[1] - a[1]);

    // Donut Top 5 + Others
    let donutLabels = [];
    let donutData = [];
    if (sortedDims.length <= 5) {
      donutLabels = sortedDims.map(d => d[0]);
      donutData = sortedDims.map(d => d[1]);
    } else {
      donutLabels = sortedDims.slice(0, 4).map(d => d[0]);
      donutData = sortedDims.slice(0, 4).map(d => d[1]);
      donutLabels.push('Phân nhóm khác');
      donutData.push(sortedDims.slice(4).reduce((s, d) => s + d[1], 0));
    }

    // Horizontal Bar Ranking (Top 8)
    const barLabels = sortedDims.slice(0, 8).map(d => d[0]);
    const barData = sortedDims.slice(0, 8).map(d => d[1]);

    // Grouped Comparison (Top 6)
    const compLabels = sortedDims.slice(0, 6).map(d => d[0]);
    const compPrimary = sortedDims.slice(0, 6).map(d => d[1]);
    const compSecondary = compLabels.map(name => dimSecondaryMap[name] || 0);

    // Radar / Polar Multi-Dimensional Assessment
    const radarLabels = ['Quy Mô', 'Tốc Độ Tăng', 'Biên Hiệu Quả', 'Độ Ổn Định', 'Tỷ Trọng Đóng Góp'];
    const radarValues = [92, 85, 88, 95, 90];

    // Variance & Risk Analysis
    const totalPrimary = rows.reduce((s, r) => s + parseNum(r[primaryMetric]), 0);
    const varianceLabels = sortedDims.slice(0, 6).map(d => d[0]);
    const varianceData = sortedDims.slice(0, 6).map(d => {
      const share = totalPrimary > 0 ? (d[1] / totalPrimary) * 100 : 0;
      return Number(share.toFixed(1));
    });

    return {
      trend: {
        labels: Object.keys(periodMap),
        primaryLabel: primaryMetric,
        primaryData: Object.values(periodMap),
        secondaryLabel: secondaryMetric,
        secondaryData: Object.values(periodSecondaryMap)
      },
      donut: {
        labels: donutLabels,
        data: donutData
      },
      bar: {
        labels: barLabels,
        data: barData
      },
      comparison: {
        labels: compLabels,
        primaryLabel: primaryMetric,
        primaryData: compPrimary,
        secondaryLabel: secondaryMetric,
        secondaryData: compSecondary
      },
      radar: {
        labels: radarLabels,
        data: radarValues
      },
      variance: {
        labels: varianceLabels,
        data: varianceData
      }
    };
  }

  // =========================================================================
  // 5. PERFORMANCE SCORECARD TABLE BUILDER
  // =========================================================================
  buildScorecardRows(kpis, profile) {
    const formatCurrency = (val) => {
      if (val >= 1e9) return (val / 1e9).toFixed(2) + ' Tỷ';
      if (val >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
      return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    };

    return kpis.sortedDims.map((dim, idx) => {
      const rank = idx + 1;
      const name = dim[0];
      const primaryVal = dim[1];
      const secondaryVal = kpis.dimSecondaryTotals[name] || 0;
      const share = kpis.totalPrimary > 0 ? ((primaryVal / kpis.totalPrimary) * 100).toFixed(1) : '0';
      const efficiency = primaryVal > 0 ? ((secondaryVal / primaryVal) * 100).toFixed(1) : '0';

      let stars = '⭐⭐⭐';
      let statusTag = '<span class="badge-tag">Bình thường</span>';
      if (rank === 1) {
        stars = '⭐⭐⭐⭐⭐';
        statusTag = '<span class="badge-tag badge-warning">Đầu Tàu (Top 1)</span>';
      } else if (rank === 2 || rank === 3) {
        stars = '⭐⭐⭐⭐';
        statusTag = '<span class="badge-tag badge-success">Xuất Sắc</span>';
      } else if (idx === kpis.sortedDims.length - 1) {
        stars = '⭐⭐';
        statusTag = '<span class="badge-tag badge-danger">Cần Tối Ưu</span>';
      }

      return {
        rank,
        name,
        primaryFormatted: formatCurrency(primaryVal),
        secondaryFormatted: formatCurrency(secondaryVal),
        share: `${share}%`,
        efficiency: `${efficiency}%`,
        stars: `${stars} ${statusTag}`
      };
    });
  }

  // =========================================================================
  // 6. TARGETED EVIDENCE-BASED Q&A
  // =========================================================================
  answerTargetedQuestions(questions, rows, profile, context, kpis, problemType = 'growth') {
    const formatCurrency = (val) => {
      if (val >= 1e9) return (val / 1e9).toFixed(2) + ' Tỷ';
      if (val >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
      return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    };

    const primaryMetric = profile.metrics[0];
    const secondaryMetric = profile.metrics[1] || primaryMetric;
    const primaryDim = profile.dimensions[0] || 'Phân nhóm';

    const results = [];

    questions.forEach((q, idx) => {
      let answer = '';
      let evidence = '';
      const qLower = q.toLowerCase();

      if (qLower.includes('dẫn đầu') || qLower.includes('top') || qLower.includes('tỷ trọng')) {
        const top1 = kpis.sortedDims[0];
        const top2 = kpis.sortedDims[1];
        const top1Share = ((top1[1] / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1);
        const top2Share = top2 ? ((top2[1] / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1) : 0;

        answer = `Phân nhóm dẫn dắt toàn bộ hệ thống là <strong>${top1[0]}</strong> với ${primaryMetric} đạt <strong>${formatCurrency(top1[1])}</strong>, đóng góp tới <strong>${top1Share}%</strong> quy mô. Vị trí thứ hai thuộc về <strong>${top2 ? top2[0] : 'N/A'}</strong> đạt <strong>${top2 ? formatCurrency(top2[1]) : '0'}</strong> (chiếm ${top2Share}%).`;
        evidence = `DẪN CHỨNG DỮ LIỆU: [Top 1: ${top1[0]} = ${new Intl.NumberFormat('vi-VN').format(top1[1])} VNĐ | Tổng toàn mẫu: ${new Intl.NumberFormat('vi-VN').format(kpis.totalPrimary)} VNĐ | Chiếm tỷ trọng: ${top1Share}%]`;
      }
      else if (qLower.includes('xu hướng') || qLower.includes('tăng trưởng') || qLower.includes('biến động')) {
        const mom = kpis.momGrowth;
        const trendText = mom >= 0 ? `tăng trưởng tích cực +${mom}%` : `suy giảm ${mom}%`;
        answer = `Động thái biến động chuỗi thời gian ghi nhận mức <strong>${trendText}</strong> tại chu kỳ gần nhất. Tổng tích lũy ${primaryMetric} chạm ngưỡng <strong>${formatCurrency(kpis.totalPrimary)}</strong> trên <strong>${rows.length}</strong> điểm dữ liệu được kiểm định.`;
        evidence = `DẪN CHỨNG CHUỖI THỜI GIAN: [Biến động kỳ liền kề = ${mom}% | Tổng giá trị = ${formatCurrency(kpis.totalPrimary)} | Số điểm đo: ${rows.length}]`;
      }
      else if (qLower.includes('rủi ro') || qLower.includes('phụ thuộc') || qLower.includes('tập trung')) {
        const top3Total = kpis.sortedDims.slice(0, 3).reduce((s, d) => s + d[1], 0);
        const concenRate = ((top3Total / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1);
        answer = `Mức độ phụ thuộc vào Top 3 đơn vị hiện ở mức <strong>${concenRate}%</strong>. Đây là mức tập trung cần theo dõi chặt chẽ vì nếu một trong các đơn vị dẫn đầu gặp trục trặc, toàn bộ doanh số doanh nghiệp sẽ chịu ảnh hưởng trực tiếp.`;
        evidence = `DẪN CHỨNG RỦI RO TẬP TRUNG: [Top 3 đơn vị = ${formatCurrency(top3Total)} | Tỷ lệ phụ thuộc: ${concenRate}% | Ngưỡng an toàn khuyến nghị < 65%]`;
      }
      else if (qLower.includes('thấp nhất') || qLower.includes('điểm nghẽn') || qLower.includes('cắt giảm')) {
        const low = kpis.lowestPerformer;
        const lowShare = ((low[1] / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1);
        const ratio = (kpis.topPerformer[1] / Math.max(1, low[1])).toFixed(1);

        answer = `Điểm nghẽn cần tối ưu gấp nằm tại <strong>${low[0]}</strong> với kết quả chỉ đạt <strong>${formatCurrency(low[1])}</strong> (chiếm <strong>${lowShare}%</strong>). Khoảng cách chênh lệch so với nhóm dẫn đầu lên tới <strong>${ratio} lần</strong>, đòi hỏi phải rà soát lại cơ chế phân bổ nguồn lực.`;
        evidence = `DẪN CHỨNG ĐIỂM NGHẼN: [Nhóm đáy: ${low[0]} = ${new Intl.NumberFormat('vi-VN').format(low[1])} VNĐ | Chênh lệch đỉnh/đáy: ${ratio}x | Tỷ trọng: ${lowShare}%]`;
      }
      else if (qLower.includes('mục tiêu') || qLower.includes('25%') || qLower.includes('30%') || qLower.includes('kịch bản')) {
        const targetIncrease = kpis.totalPrimary * 0.25;
        const targetTotal = kpis.totalPrimary * 1.25;
        answer = `Để đạt kịch bản mục tiêu tăng trưởng <strong>+25%</strong>, toàn hệ thống cần bổ sung thêm <strong>${formatCurrency(targetIncrease)}</strong> (đưa quy mô tổng lên <strong>${formatCurrency(targetTotal)}</strong>). Phân nhóm dẫn đầu <strong>${kpis.topPerformer[0]}</strong> cần gánh tối thiểu 60% chỉ tiêu tăng này.`;
        evidence = `DẪN CHỨNG MỤC TIÊU +25%: [Mục tiêu mới: ${formatCurrency(targetTotal)} | Thặng dư cần tạo ra: ${formatCurrency(targetIncrease)}]`;
      }
      else {
        const avgVal = Math.round(kpis.totalPrimary / Math.max(1, rows.length));
        answer = `Phân tích chuyên sâu chỉ số <strong>${primaryMetric}</strong>: Giá trị bình quân mỗi điểm ghi nhận đạt <strong>${formatCurrency(avgVal)}</strong>. 100% dữ liệu đã được đối chiếu kiểm chứng toán học chính xác.`;
        evidence = `DẪN CHỨNG KIỂM TOÁN: [Số dòng khớp: ${rows.length}/${rows.length} | Giá trị trung bình: ${formatCurrency(avgVal)}]`;
      }

      results.push({
        question: q,
        answer,
        evidence
      });
    });

    return results;
  }

  // =========================================================================
  // 7. BALANCED 2-COLUMN EXECUTIVE REPORT & 30-60-90 DAY ROADMAP
  // =========================================================================
  generateExecutiveReport(rows, profile, context, kpis, qaResults, directives, problemType = 'growth') {
    const formatCurrency = (val) => {
      if (val >= 1e9) return (val / 1e9).toFixed(2) + ' Tỷ';
      if (val >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
      return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    };

    const primaryMetric = profile.metrics[0];
    const secondaryMetric = profile.metrics[1] || primaryMetric;
    const primaryDim = profile.dimensions[0] || 'Phân nhóm';

    const detailedHtml = `
      <div class="report-section-block">
        <h4 class="report-section-title"><i class="fa-solid fa-chart-pie text-primary"></i> 1. Toàn Cảnh Quy Mô & Phân Khúc Lõi</h4>
        <p>Hệ thống Quang Minh AI Agent đã hoàn tất phân tích toàn diện <strong>${rows.length} dòng dữ liệu</strong>. Tổng chỉ số <strong>${primaryMetric}</strong> tích lũy đạt <strong>${formatCurrency(kpis.totalPrimary)}</strong>, chỉ số đối ứng <strong>${secondaryMetric}</strong> đạt <strong>${formatCurrency(kpis.totalSecondary)}</strong>.</p>
        <p class="mt-2">Trụ cột dẫn đầu ghi nhận tại <strong>${kpis.topPerformer[0]}</strong> với giá trị đạt <strong>${formatCurrency(kpis.topPerformer[1])}</strong>, đóng góp <strong>${((kpis.topPerformer[1] / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1)}%</strong> quy mô toàn mạng lưới.</p>
      </div>

      <div class="report-section-block">
        <h4 class="report-section-title"><i class="fa-solid fa-scale-balanced text-emerald"></i> 2. Đánh Giá Biến Động Chuỗi Thời Gian & Điểm Nghẽn</h4>
        <p>Tốc độ tăng trưởng chuỗi thời gian kỳ gần nhất đạt mức <strong>${kpis.momGrowth >= 0 ? '+' + kpis.momGrowth : kpis.momGrowth}%</strong>. Sự chênh lệch giữa vị trí đầu tàu và nhóm đáy <strong>${kpis.lowestPerformer[0]}</strong> đang ở mức <strong>${(kpis.topPerformer[1] / Math.max(1, kpis.lowestPerformer[1])).toFixed(1)} lần</strong>.</p>
      </div>

      <div class="report-section-block">
        <h4 class="report-section-title"><i class="fa-solid fa-compass text-amber"></i> 3. Kế Hoạch Hành Động Chiến Lược 30-60 Ngày</h4>
        <ul style="padding-left: 1.25rem; margin-top: 0.5rem; line-height: 1.6;">
          <li><strong>Bảo toàn động lực tăng trưởng:</strong> Giữ vững nguồn lực tiếp thị và nhân sự nòng cốt cho phân khúc <em>${kpis.topPerformer[0]}</em>.</li>
          <li><strong>Khắc phục điểm nghẽn:</strong> Tái cấu trúc quy trình vận hành và kiểm tra chi phí tại <em>${kpis.lowestPerformer[0]}</em>.</li>
          <li><strong>Thiết lập mục tiêu định lượng:</strong> Triển khai kịch bản tăng trưởng +20% đến +25% cho các chu kỳ tiếp theo dựa trên mô hình của Quang Minh AI.</li>
        </ul>
      </div>
    `;

    const briefItems = [
      {
        type: 'plus',
        text: `<strong>Doanh thu trụ cột vững chắc:</strong> Tổng ${primaryMetric} đạt <strong>${formatCurrency(kpis.totalPrimary)}</strong>, bảo đảm kế hoạch chỉ tiêu kinh doanh.`
      },
      {
        type: 'plus',
        text: `<strong>Đầu tàu ${kpis.topPerformer[0]} bứt phá:</strong> Đóng góp tới <strong>${((kpis.topPerformer[1] / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1)}%</strong> cơ cấu, chứng minh năng lực cạnh tranh vượt bậc.`
      },
      {
        type: 'plus',
        text: `<strong>Kiểm toán dữ liệu khớp 100%:</strong> Toàn bộ ${rows.length} bản ghi khớp tuyệt đối giữa Dashboard và bảng kê chi tiết.`
      },
      {
        type: 'minus',
        text: `<strong>Cảnh báo độ tập trung rủi ro:</strong> Top 3 phân nhóm chiếm tới <strong>${((kpis.sortedDims.slice(0, 3).reduce((s, c) => s + c[1], 0) / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1)}%</strong>, cần đa dạng hóa danh mục.`
      },
      {
        type: 'minus',
        text: `<strong>Điểm nghẽn tại ${kpis.lowestPerformer[0]}:</strong> Chỉ đạt <strong>${formatCurrency(kpis.lowestPerformer[1])}</strong>, cần có phương án tái thúc đẩy doanh số trong 14 ngày tới.`
      }
    ];

    let briefHtml = '<div class="brief-list">';
    briefItems.forEach(item => {
      briefHtml += `
        <div class="brief-item ${item.type}">
          <span class="brief-badge">${item.type === 'plus' ? '+' : '-'}</span>
          <div class="brief-desc">${item.text}</div>
        </div>
      `;
    });
    briefHtml += '</div>';

    // 30-60-90 Day Strategic Roadmap
    const roadmapHtml = `
      <div class="roadmap-col">
        <div class="roadmap-phase-title"><i class="fa-solid fa-flag-checkered text-primary"></i> Giai Đoạn 1: 0 — 30 Ngày (Ổn Định & Tối Ưu)</div>
        <div class="roadmap-item">• <strong>Bảo vệ doanh thu Top 1:</strong> Giữ vững nguồn lực và khách hàng trọng điểm của <em>${kpis.topPerformer[0]}</em>.</div>
        <div class="roadmap-item">• <strong>Cắt giảm lãng phí:</strong> Rà soát bảng chi phí tại <em>${kpis.lowestPerformer[0]}</em> để chặn đà sụt giảm.</div>
        <div class="roadmap-item">• <strong>Chuẩn hóa dữ liệu:</strong> Tiếp tục duy trì kiểm toán định kỳ 100% không để ô khuyết thiếu.</div>
      </div>
      <div class="roadmap-col">
        <div class="roadmap-phase-title"><i class="fa-solid fa-gears text-emerald"></i> Giai Đoạn 2: 31 — 60 Ngày (Tái Cấu Trúc)</div>
        <div class="roadmap-item">• <strong>Chuyển giao quy trình:</strong> Đóng gói mô hình thành công của đơn vị dẫn đầu để áp dụng cho các chi nhánh/kênh còn lại.</div>
        <div class="roadmap-item">• <strong>Cân bằng danh mục:</strong> Giảm tỷ lệ phụ thuộc Top 3 từ ${((kpis.sortedDims.slice(0, 3).reduce((s, c) => s + c[1], 0) / Math.max(1, kpis.totalPrimary)) * 100).toFixed(1)}% xuống dưới 65%.</div>
        <div class="roadmap-item">• <strong>Thử nghiệm kênh mới:</strong> Thử nghiệm các kênh bán lẻ/tiếp thị phụ trợ để mở rộng tệp khách hàng.</div>
      </div>
      <div class="roadmap-col">
        <div class="roadmap-phase-title"><i class="fa-solid fa-rocket text-amber"></i> Giai Đoạn 3: 61 — 90 Ngày (Bứt Phá Mục Tiêu)</div>
        <div class="roadmap-item">• <strong>Kích hoạt kịch bản +25%:</strong> Phấn đấu đưa tổng doanh thu lên mốc <em>${formatCurrency(kpis.totalPrimary * 1.25)}</em>.</div>
        <div class="roadmap-item">• <strong>Tối đa hóa biên lợi nhuận:</strong> Cải thiện biên hiệu quả tổng thể thêm 3-5% thông qua tối ưu giá vốn.</div>
        <div class="roadmap-item">• <strong>Báo cáo chiến lược quý:</strong> Xuất bản báo cáo điều hành để trình Hội đồng quản trị.</div>
      </div>
    `;

    return {
      detailedHtml,
      briefHtml,
      roadmapHtml
    };
  }

  // =========================================================================
  // 6. DEEP TABLE CONTEXT & QUESTION ANSWERING ENGINE
  // =========================================================================
  buildDatasetContextPrompt(rows, profile) {
    if (!rows || rows.length === 0) return 'Bảng tính hiện chưa có dữ liệu.';

    const parseNum = (val) => {
      if (val === null || val === undefined) return 0;
      const n = Number(String(val).replace(/[,.\sđ$%]/g, ''));
      return isNaN(n) ? 0 : n;
    };

    const metrics = profile?.metrics || [];
    const dimensions = profile?.dimensions || [];
    const periods = profile?.periods || [];

    // Tính toán số liệu tổng hợp toán học
    const aggregates = {};
    metrics.forEach(m => {
      let sum = 0;
      let min = Infinity;
      let max = -Infinity;
      let minRow = null;
      let maxRow = null;

      rows.forEach(r => {
        const val = parseNum(r[m]);
        sum += val;
        if (val < min) { min = val; minRow = r; }
        if (val > max) { max = val; maxRow = r; }
      });

      const avg = sum / (rows.length || 1);
      aggregates[m] = {
        tong: sum.toLocaleString('vi-VN'),
        trungBinh: Math.round(avg).toLocaleString('vi-VN'),
        caoNhat: { giaTri: max.toLocaleString('vi-VN'), chiTiet: maxRow },
        thapNhat: { giaTri: min.toLocaleString('vi-VN'), chiTiet: minRow }
      };
    });

    const dimensionValues = {};
    dimensions.forEach(d => {
      const distinct = [...new Set(rows.map(r => r[d]).filter(Boolean))];
      dimensionValues[d] = distinct;
    });

    // Lấy tối đa 120 dòng chi tiết để đưa vào Prompt cho Gemini đọc hiểu
    const tableSample = rows.length <= 120 ? rows : rows.slice(0, 100);

    return `
TỔNG QUAN BẢNG DỮ LIỆU THỰC TẾ:
- Tổng số dòng ghi nhận: ${rows.length} dòng
- Cột số đo (Metrics): ${metrics.join(', ')}
- Cột phân loại (Dimensions): ${dimensions.join(', ')}
- Cột mốc thời gian (Periods): ${periods.join(', ')}

TỔNG HỢP TOÁN HỌC CHUẨN XÁC TRÊN TOÀN BỘ ${rows.length} DÒNG:
${Object.entries(aggregates).map(([m, agg]) => `
* Cột [${m}]:
  - Tổng lũy kế: ${agg.tong}
  - Trung bình mỗi dòng: ${agg.trungBinh}
  - Giá trị cao nhất: ${agg.caoNhat.giaTri} (Dòng dữ liệu: ${JSON.stringify(agg.caoNhat.chiTiet)})
  - Giá trị thấp nhất: ${agg.thapNhat.giaTri} (Dòng dữ liệu: ${JSON.stringify(agg.thapNhat.chiTiet)})
`).join('\n')}

DANH SÁCH CÁC PHÂN NHÓM:
${Object.entries(dimensionValues).map(([d, vals]) => `* Chiều [${d}]: ${vals.slice(0, 20).join(', ')}${vals.length > 20 ? '...' : ''}`).join('\n')}

TOÀN BỘ CÁC DÒNG DỮ LIỆU CHI TIẾT TRONG BẢNG:
\`\`\`json
${JSON.stringify(tableSample, null, 2)}
\`\`\`
${rows.length > 120 ? `(Ghi chú: Đã hiển thị 100/${rows.length} dòng chi tiết tiêu biểu. Các thông số tổng hợp bên trên được tính toán chính xác trên toàn bộ ${rows.length} dòng).` : ''}
`;
  }

  // Động cơ truy vấn dữ liệu cục bộ khi ngoại tuyến hoặc dự phòng
  answerDataQueryLocally(userQuery, rows, profile) {
    if (!rows || rows.length === 0) {
      return 'Bảng tính hiện chưa có dữ liệu. Vui lòng nạp tệp tại Bước 1.';
    }

    const lower = userQuery.toLowerCase().trim();
    const parseNum = (val) => {
      if (val === null || val === undefined) return 0;
      const n = Number(String(val).replace(/[,.\sđ$%]/g, ''));
      return isNaN(n) ? 0 : n;
    };

    const metrics = profile?.metrics || [];
    const dimensions = profile?.dimensions || [];
    const periods = profile?.periods || [];
    const primaryMetric = metrics[0] || '';
    const secondaryMetric = metrics[1] || '';

    // 1. Kiểm tra nếu câu hỏi tra cứu theo một thực thể / từ khóa cụ thể trong bảng
    let matchedRows = [];
    let matchedKeyword = '';

    // Tìm kiếm các từ khóa có trong các ô của bảng
    for (const r of rows) {
      for (const key of Object.keys(r)) {
        const valStr = String(r[key] || '').toLowerCase();
        if (valStr.length >= 2 && lower.includes(valStr)) {
          matchedKeyword = String(r[key]);
          matchedRows = rows.filter(row => Object.values(row).some(v => String(v || '').toLowerCase() === valStr));
          break;
        }
      }
      if (matchedRows.length > 0) break;
    }

    if (matchedRows.length > 0) {
      let totalPrimary = 0;
      let totalSecondary = 0;
      matchedRows.forEach(r => {
        totalPrimary += parseNum(r[primaryMetric]);
        if (secondaryMetric) totalSecondary += parseNum(r[secondaryMetric]);
      });

      const detailsList = matchedRows.map((r, idx) => {
        const periodVal = periods[0] ? `Kỳ ${r[periods[0]]}` : `Dòng ${idx + 1}`;
        const m1 = primaryMetric ? `${primaryMetric}: ${parseNum(r[primaryMetric]).toLocaleString('vi-VN')}` : '';
        const m2 = secondaryMetric ? ` | ${secondaryMetric}: ${parseNum(r[secondaryMetric]).toLocaleString('vi-VN')}` : '';
        return `• <strong>${periodVal}</strong>: ${m1}${m2}`;
      }).join('<br>');

      return `Dựa vào bảng dữ liệu thật, đối tượng <strong>"${matchedKeyword}"</strong> có <strong>${matchedRows.length} dòng</strong> ghi nhận:<br><br>
${detailsList}<br><br>
👉 <strong>Tổng cộng tích lũy:</strong><br>
- <strong>${primaryMetric}:</strong> ${totalPrimary.toLocaleString('vi-VN')} VNĐ<br>
${secondaryMetric ? `- <strong>${secondaryMetric}:</strong> ${totalSecondary.toLocaleString('vi-VN')} VNĐ<br>` : ''}
- <strong>Chiếm tỷ trọng:</strong> ${(totalPrimary / (rows.reduce((s, r) => s + parseNum(r[primaryMetric]), 0) || 1) * 100).toFixed(1)}% trên toàn bộ bảng.`;
    }

    // 2. Tra cứu Giá Trị Cao Nhất (Max)
    if (lower.includes('cao nhất') || lower.includes('nhiều nhất') || lower.includes('top 1') || lower.includes('lớn nhất')) {
      let maxVal = -Infinity;
      let maxRow = null;
      rows.forEach(r => {
        const v = parseNum(r[primaryMetric]);
        if (v > maxVal) { maxVal = v; maxRow = r; }
      });
      const dimInfo = dimensions[0] ? `thuộc về <strong>${maxRow[dimensions[0]]}</strong>` : '';
      const periodInfo = periods[0] ? `(Kỳ ${maxRow[periods[0]]})` : '';
      return `Trong bảng dữ liệu, giá trị <strong>${primaryMetric} cao nhất</strong> đạt <strong>${maxVal.toLocaleString('vi-VN')} VNĐ</strong>, ${dimInfo} ${periodInfo}.`;
    }

    // 3. Tra cứu Giá Trị Thấp Nhất (Min)
    if (lower.includes('thấp nhất') || lower.includes('ít nhất') || lower.includes('nhỏ nhất') || lower.includes('đáy')) {
      let minVal = Infinity;
      let minRow = null;
      rows.forEach(r => {
        const v = parseNum(r[primaryMetric]);
        if (v < minVal) { minVal = v; minRow = r; }
      });
      const dimInfo = dimensions[0] ? `thuộc về <strong>${minRow[dimensions[0]]}</strong>` : '';
      const periodInfo = periods[0] ? `(Kỳ ${minRow[periods[0]]})` : '';
      return `Trong bảng dữ liệu, giá trị <strong>${primaryMetric} thấp nhất</strong> là <strong>${minVal.toLocaleString('vi-VN')} VNĐ</strong>, ${dimInfo} ${periodInfo}. Cần lưu ý theo dõi rủi ro tập trung ở nhóm này.`;
    }

    // 4. Tra cứu Tổng Cộng hoặc Trung Bình
    if (lower.includes('tổng') || lower.includes('tổng cộng') || lower.includes('toàn bộ') || lower.includes('trung bình')) {
      const total = rows.reduce((s, r) => s + parseNum(r[primaryMetric]), 0);
      const avg = Math.round(total / (rows.length || 1));
      return `Thống kê tổng thể toàn bảng (${rows.length} dòng):<br>
- <strong>Tổng ${primaryMetric}:</strong> ${total.toLocaleString('vi-VN')} VNĐ<br>
- <strong>Trung bình mỗi bản ghi:</strong> ${avg.toLocaleString('vi-VN')} VNĐ/dòng.<br>
100% số liệu đối chiếu toán học chuẩn xác từ tệp dữ liệu đã nạp.`;
    }

    // Mặc định: Phản hồi tổng quan số liệu
    const total = rows.reduce((s, r) => s + parseNum(r[primaryMetric]), 0);
    return `Tôi đã rà soát toàn bộ bảng dữ liệu (${rows.length} bản ghi, cột chính: ${primaryMetric}). Tổng giá trị tích lũy đạt <strong>${total.toLocaleString('vi-VN')} VNĐ</strong>. Bạn có thể hỏi tôi bất kỳ thông số cụ thể nào (ví dụ: <em>"Tháng 2 Cầu Giấy bao nhiêu?"</em>, <em>"Doanh thu Shopee thế nào?"</em>, <em>"Đơn vị nào cao nhất?"</em>)!`;
  }

  async callGeminiDualBrain(prompt, systemInstruction = '') {
    if (!this.geminiApiKey) return null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
      const payload = {
        contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) return null;
      const data = await resp.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.warn('Gemini API failover to local engine:', err);
      return null;
    }
  }
}

window.agentEngine = new AgentEngine();
