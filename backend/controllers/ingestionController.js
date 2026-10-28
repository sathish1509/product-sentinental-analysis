const fs = require('fs');
const path = require('path');
const { predictSentiment } = require('../services/sentimentInferenceService');

/**
 * Basic robust CSV Parser supporting quoted fields with commas and newlines
 */
const parseCSV = (csvText) => {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' || char === "'") {
      if (inQuotes && nextChar === char) {
        currentField += char;
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip CRLF
      }
      row.push(currentField.trim());
      if (row.some(f => f.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || row.length > 0) {
    row.push(currentField.trim());
    if (row.some(f => f.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
};

/**
 * Ingestion handler: accepts CSV text, validates schema, deduplicates, cleans, and runs sentiment inference
 */
const uploadAndProcessCSV = async (req, res) => {
  try {
    let csvContent = '';
    let appendToDataset = false;
    let filename = 'uploaded_reviews.csv';

    if (typeof req.body === 'string') {
      csvContent = req.body;
    } else if (req.body && req.body.csvText) {
      csvContent = req.body.csvText;
      appendToDataset = Boolean(req.body.appendToDataset);
      filename = req.body.filename || filename;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected raw CSV text or JSON with "csvText" field.'
      });
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CSV content is empty. Please provide valid CSV data.'
      });
    }

    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'CSV must contain at least a header row and one data record.'
      });
    }

    const rawHeaders = rows[0].map(h => h.trim());
    const headersLower = rawHeaders.map(h => h.toLowerCase());

    // Flexible column resolution
    const findColIdx = (candidates) => {
      for (const cand of candidates) {
        const idx = headersLower.findIndex(h => h === cand || h.includes(cand));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const textIdx = findColIdx(['review_text', 'reviewtext', 'review', 'text', 'comment', 'feedback', 'body']);
    const titleIdx = findColIdx(['review_title', 'reviewtitle', 'summary', 'title', 'headline']);
    const ratingIdx = findColIdx(['rating', 'rate', 'score', 'stars']);
    const productIdx = findColIdx(['product_id', 'productid', 'asin', 'item_id', 'itemid']);
    const productNameIdx = findColIdx(['product_name', 'productname', 'product', 'item_name']);
    const categoryIdx = findColIdx(['category', 'genre', 'department']);
    const dateIdx = findColIdx(['review_date', 'reviewdate', 'date', 'time', 'timestamp']);

    if (textIdx === -1 && titleIdx === -1) {
      return res.status(400).json({
        success: false,
        error: 'Schema Validation Failed: Missing review text column. CSV must contain a column like "review_text", "Review", "Text", or "Summary".',
        found_columns: rawHeaders
      });
    }

    const dataRows = rows.slice(1);
    const seenTexts = new Set();
    const processedReviews = [];
    let duplicatesCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const textVal = textIdx !== -1 ? (row[textIdx] || '') : '';
      const titleVal = titleIdx !== -1 ? (row[titleIdx] || '') : '';
      const combinedText = `${titleVal} ${textVal}`.trim();

      if (combinedText.length < 3) {
        invalidCount++;
        continue;
      }

      // Check duplicates
      const dedupKey = combinedText.toLowerCase();
      if (seenTexts.has(dedupKey)) {
        duplicatesCount++;
        continue;
      }
      seenTexts.add(dedupKey);

      let parsedRating = 4;
      if (ratingIdx !== -1 && row[ratingIdx]) {
        const num = parseFloat(row[ratingIdx]);
        if (!isNaN(num) && num >= 1 && num <= 5) {
          parsedRating = Math.round(num);
        }
      }

      const pId = productIdx !== -1 && row[productIdx] ? row[productIdx] : `UP-${i + 1}`;
      const pName = productNameIdx !== -1 && row[productNameIdx] ? row[productNameIdx] : `Imported Product (${pId})`;
      const cat = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Imported';
      const rDate = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0];

      // Run real-time sentiment inference
      const inference = await predictSentiment(combinedText, parsedRating);

      processedReviews.push({
        review_id: `ING-${Date.now()}-${i + 1}`,
        product_id: pId,
        product_name: pName,
        category: cat,
        review_title: titleVal || 'Customer Review',
        review_text: textVal || combinedText,
        rating: parsedRating,
        review_date: rDate,
        verified_purchase: true,
        sentiment: inference.sentiment,
        confidence: inference.confidence,
        aspects: inference.aspects || [],
        source: 'uploaded_csv'
      });
    }

    // Sentiment breakdown
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    processedReviews.forEach(r => {
      sentimentCounts[r.sentiment] = (sentimentCounts[r.sentiment] || 0) + 1;
    });

    // Optionally append to dataset on disk
    if (appendToDataset && processedReviews.length > 0) {
      try {
        const processedCsvPath = path.join(__dirname, '..', '..', 'data', 'processed', 'cleaned_reviews.csv');
        if (fs.existsSync(processedCsvPath)) {
          const linesToAppend = processedReviews.map(r => 
            `"${r.product_id}","${r.product_name}","${r.category}","${r.review_title.replace(/"/g, '""')}","${r.review_text.replace(/"/g, '""')}",${r.rating},"${r.review_date}",true,"${r.review_text.replace(/"/g, '""')}","${r.review_text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '')}","${r.review_text.toLowerCase()}"`
          ).join('\n');
          fs.appendFileSync(processedCsvPath, '\n' + linesToAppend, 'utf8');
        }
      } catch (saveErr) {
        console.warn('[!] Could not append to processed dataset file:', saveErr.message);
      }
    }

    return res.json({
      success: true,
      filename: filename,
      summary: {
        total_rows_received: dataRows.length,
        valid_reviews_processed: processedReviews.length,
        duplicates_removed: duplicatesCount,
        invalid_rows_skipped: invalidCount,
        sentiment_distribution: sentimentCounts,
        detected_columns: rawHeaders
      },
      sample_records: processedReviews.slice(0, 10),
      all_records: processedReviews
    });

  } catch (error) {
    console.error('Error in uploadAndProcessCSV:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process uploaded CSV file: ' + error.message
    });
  }
};

module.exports = { uploadAndProcessCSV };
