import { getSession } from "@auth0/nextjs-auth0";
import LandingPage from '../components/LandingPage';
import HomePage from '../components/HomePage';
import Menu from '../components/Menu';

export default async function Index() {
  const session = await getSession();

  // If user is not authenticated, show landing page
  if (!session) {
    return (
      <>
        <Menu />
        <LandingPage />
      </>
    );
  }

  // If user is authenticated, show their flashcard sets
  return (
    <>
      <Menu />
      <HomePage />
    </>
  );
}