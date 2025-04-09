import React, { useState, useEffect } from 'react';
import { searchUsers } from '../../services/searchApi';
import SearchItem from '../../components/Search/SearchItem';
import Navbar from '../../components/Layout/Navbar';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        const res = await searchUsers(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      }
    };

    const delayDebounce = setTimeout(fetchResults, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <>
      <Navbar />
      <div style={styles.wrapper}>
        <div style={styles.page}>
          <h2 style={styles.title}>🔍 Search</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <div style={styles.results}>
            {results.length > 0 ? (
              results.map((user) => <SearchItem key={user.id} user={user} />)
            ) : (
              query && <p style={styles.noResult}>No results found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      padding: '0 20px',
      marginTop: '20px',
      minHeight: 'calc(100vh - 120px)', // navbar + üst boşluk için
      backgroundColor: '#f5f5f5'
    },
    page: {
      width: '50%',
      backgroundColor: '#fff',
      borderRadius: '30px',
      padding: '40px 30px',
      boxShadow: '0 0 12px rgba(0,0,0,0.08)',
      border: '2px solid #ccc',
      textAlign: 'center',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    },
    title: {
      fontSize: '24px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    input: {
      width: '96%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      fontSize: '16px',
      marginBottom: '20px'
    },
    results: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1
    },
    noResult: {
      color: '#888',
      marginTop: '40px'
    }
  };
  
  

export default SearchPage;
