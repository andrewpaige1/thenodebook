"use client"

import { useUser } from '@auth0/nextjs-auth0/client';
import LandingPage from '../components/LandingPage';
import HomePage from '../components/HomePage';
import Menu from '../components/Menu';


export default  function Index() {
  const { user, isLoading } = useUser();


  if (isLoading) return
  // If user is not authenticated, show landing page
  if (!user) {
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