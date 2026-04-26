const API_KEY = '9486e0224b8c94962dfdc6fe4a994be2';
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Custom function to get Movie/TV ID by title.
 * Usage in Sheet: =GET_TMDB_ID("Inception", "movie")
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Movie Search Player')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// This function bridges the search bar and the spreadsheet
function processSearch(movieTitle) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // 1. Put the searched title into A2
  sheet.getRange("A2").setValue(movieTitle);
  
  // 2. Spreadsheets take a moment to recalculate. 
  // Flush ensures the sheet updates before we read B2.
  SpreadsheetApp.flush();
  Utilities.sleep(500); 
  
  // 3. Fetch the ID result from B2
  const movieId = sheet.getRange("B2").getValue();
  
  return movieId;
}


function GET_TMDB_ID(query, type = "movie") {
  if (!query) return "No title provided";
  
  const searchType = type === "tv" ? "tv" : "movie";
  const url = `${BASE_URL}/search/${searchType}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    if (data.results && data.results.length > 0) {
      return data.results[0].id; // Returns the ID of the first/closest match
    }
    return "Not Found";
  } catch (e) {
    return "Error: " + e.toString();
  }
}

/**
 * Fetches episode IDs for a specific TV Show season.
 * Usage: =GET_EPISODE_IDS(70796, 1)
 */
function GET_EPISODE_IDS(tvId, seasonNumber) {
  if (!tvId || !seasonNumber) return "Missing TV ID or Season";
  
  const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    if (data.episodes) {
      // Returns a comma-separated list of episode IDs
      return data.episodes.map(ep => ep.id).join(", ");
    }
    return "No Episodes Found";
  } catch (e) {
    return "Error: " + e.toString();
  }
}