export async function fetchWithAuth(url, options = {}) {
  const authToken = sessionStorage.getItem("token");
  console.log("Sending token :  "+authToken);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(authToken && { "Authorization": `Basic ${authToken}` }),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
    }
    throw new Error(errorMessage);
  }

  return response;
}
