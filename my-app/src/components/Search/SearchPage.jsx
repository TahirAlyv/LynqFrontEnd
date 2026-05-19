import React, { useState, useEffect } from 'react';
import { searchUsers } from '../../services/searchApi';
import SearchItem from '../../components/Search/SearchItem';
import Navbar from '../../components/Layout/Navbar';
import { RefreshContext } from '../../context/RefreshContext';
import { SearchContext } from '../../context/SearchContext';
import { useContext } from 'react'; 

const SearchPage = () => {
 
const [results, setResults] = useState([]);
const { query, setQuery } = useContext(SearchContext);
const[slecetedFilter,setSelectedFilter] = useState('All');
const [filtredResults, setFilteredResults] = useState(results);
const { refreshData } = useContext(RefreshContext);

 
useEffect(() => {
  setFilteredResults(
    slecetedFilter === "All"
      ? results
      : results.filter((user) => user.role === slecetedFilter)
  );
}, [results, slecetedFilter]);

console.log("Initial query:", query);

useEffect(() => {
    const fetchResults = async () => {
    if (query.trim().length === 0) {
        setResults([]);
        return;
    }
    
        try {
            const res = await searchUsers(query);
            setResults(res);
            console.log(res);
          } catch (err) {
            console.error('Search error:', err);
          }
        };
    
        const delayDebounce = setTimeout(fetchResults, 400);
        return () => clearTimeout(delayDebounce);
}, [refreshData,query]);

 
  return (
    <>
      <Navbar />
      <div style={styles.wrapper}>
   
          <div style={styles.filterConbainer}>
            <p style={styles.titleFilter}>Filter by Type</p>
            
             <div style={styles.choiceText}>
                <div style={styles.selectContainer} onClick={() => setSelectedFilter("All")} >
                   {slecetedFilter === 'All' && <div style={styles.selected}/>}
                  <p style={{ margin: 0,marginBottom: 20,cursor: "pointer" }}>All</p>
                </div>
                <div style={styles.selectContainer} onClick={() => setSelectedFilter("Employer")} >
                  {slecetedFilter === 'Employer' && <div style={styles.selected}/>}
                  <p style={{ margin: 0,marginBottom: 20,cursor: "pointer" }}>Employeer</p>
                </div>
                <div style={styles.selectContainer} onClick={() => setSelectedFilter("JobSeeker")}>
                     {slecetedFilter === 'JobSeeker' && <div style={styles.selected}/>}
                  <p style={{ margin: 0,marginBottom: 20,cursor: "pointer" }}> JobSeeker</p>
                </div>
             </div>
         
          </div>
        
         <div style={styles.page}>
             {filtredResults.length > 0 ? (
              <div style={{ width: '90%', marginTop: 20, overflowY: 'auto', height: '620px' }}> 
                {filtredResults.map((user) => (
                  <SearchItem key={user.id} user={user}/>
                ))}
              </div>
             ): 
             (<></>)}
 
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
      minHeight: 'calc(100vh - 120px)',  
      backgroundColor: '#f5f5f5',
      height: '100vh',
 
    },

    page: {
      marginTop: 20,
      width: '650px',
      height: '680px',
      backgroundColor: '#ffffffff',
      borderRadius: 20,
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      marginRight:  "150px",
 
 
    },

    filterConbainer:{
      width: '180px',
      height: '200px',
      backgroundColor: '#ffffffff',
      marginTop: 30,
      marginRight: 40,
      borderRadius: 10,
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      position: 'realative',
 
     
    },

    titleFilter: {
      fontSize: 18,
      marginBottom: 10,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      fontWeight: "600",
      color: '#0073b1',
     
    },
    choiceText:{
      fontSize: 16,
      marginBottom: 8,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      marginLeft: 35,
      marginTop: 25,
      width: "100%",
 
    },

    selected: {
      width: "10px",
      height: "10px",
      borderRadius: "10px",
      backgroundColor: 'green',
      marginBottom: 16,
      right: 190,
      position: 'absolute',
 
    },

    selectContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
     
     

    }
   
 
   
  };
  
  

export default SearchPage;









 