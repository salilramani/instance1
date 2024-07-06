"use client";

import { useEffect, useState, useRef } from 'react';
import Markupiframe from '@/app/components/Markupiframe';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams(); // Use useParams to get the dynamic segments
  const id = params[":id"]; // Destructure 'id' from params
  const [markupUrl, setMarkupUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('browse');
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchMarkupUrl = async () => {
      try {
        if (id) {
          console.log(`Fetching markup URL for ID: ${id}`); // Log the ID for debugging
          const response = await fetch(`/api/getMarkupById?id=${id}`);
          if (!response.ok) {
            throw new Error('Error fetching markup URL');
          }
          const result = await response.json();
          console.log(`Fetched Markup URL: ${result.markup_url}`); // Log the fetched URL for debugging
          // Use the proxy route with the fetched markup URL
          setMarkupUrl(`/api/proxy?url=${encodeURIComponent(result.markup_url)}`);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkupUrl();
  }, [id]);

  const toggleMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'browse' ? 'comment' : 'browse';
      if (iframeRef.current) {
        iframeRef.current.contentWindow.clickBlockingEnabled = newMode === 'comment';
      }
      return newMode;
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Markup for ID: {id}</h1>
      <button onClick={toggleMode} className="bg-blue-500 text-white px-4 py-2 rounded">
        {mode === 'browse' ? 'Switch to Comment Mode' : 'Switch to Browse Mode'}
      </button>
      <div className='bg-black'>
        <Markupiframe markupUrl={markupUrl} iframeRef={iframeRef} />
      </div>
    </div>
  );
};

export default Page;