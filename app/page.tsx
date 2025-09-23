import { auth0 } from '../lib/auth0';
import LandingPage from '../components/LandingPage';
import HomePage from '../components/HomePage';
import Menu from '../components/Menu';

export default async function Index() {
  const session = await auth0.getSession();
  let token: string | null = null;
  let accessTokenError: any = null;
  try {
    const result = await auth0.getAccessToken();
    token = result?.token;
  } catch (err: any) {
    accessTokenError = err;
  }

  // If user is not authenticated, or token error, show landing page
  if (!session || !token || (accessTokenError && accessTokenError.name === 'AccessTokenError')) {
    return (
      <>
        {/*<Menu />*/}
        <LandingPage />
        {accessTokenError && accessTokenError.name === 'AccessTokenError' && (
          <div className="bg-red-100 text-red-700 p-4 rounded mt-4 text-center">
            {/* eslint-disable @next/next/no-html-link-for-pages */}
            Your session has expired. Please <a href="/api/auth/login" className="underline font-semibold">log in again</a>.
          </div>
        )}
      </>
    );
  }

  // If user is authenticated, show their flashcard sets
  return (
    <>
     {/* <Menu />*/}
      <HomePage />
    </>
  );
}