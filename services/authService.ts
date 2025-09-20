export async function fetchAccessToken(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL!;
  try {
    const res = await fetch(`${baseUrl}/api/auth/token/`, {
      method: "GET"
    });
    if (!res.ok) {
      const errorText = await res.text();
     // console.error(`Failed to fetch access token: HTTP ${res.status} - ${res.statusText}`);
     // console.error(`Response body: ${errorText}`);
      //throw new Error(`Failed to fetch access token: ${res.status} ${res.statusText}`);
      return `${JSON.stringify(errorText)}`
    }
    const data = await res.json();
    if (!data.accessToken) {
     // console.error('No accessToken in response:', data);
      //throw new Error('No accessToken in response');
      return ''
    }
    return data.accessToken;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching access token:', error.message);
      //if (error.stack) console.error(error.stack);
    } else {
      console.error('Unknown error fetching access token:', error);
    }
    //throw error;
    return ''
  }
}
