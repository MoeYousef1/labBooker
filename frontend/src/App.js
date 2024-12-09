import React, { useEffect } from 'react';
import axios from 'axios';

function App() {
  useEffect(() => {
    axios.get('http://localhost:5000')
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <div>Frontend Connected!</div>;
}

export default App;
