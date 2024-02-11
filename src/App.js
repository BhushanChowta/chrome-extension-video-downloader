// App.js
import React, { useState, useEffect } from 'react';
import { Container, Box, List, ListItem, ListItemText } from '@mui/material';

function App() {
  const [tabData, setTabData] = useState({});

  useEffect(() => {
    const fetchData = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: getPageData
          }, (results) => {
            const { title, videoSrc } = results[0].result;
            setTabData({ title, videoSrc });
          });
        }
      });
    };

    const getPageData = () => {
      const title = document.title;
      const video = document.querySelector('video');
      const videoSrc = video ? video.src : null;
      return { title, videoSrc };
    };

    const handleTabChange = () => {
      setTabData({});
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // fetch every 5 seconds

    chrome.tabs.onActivated.addListener(handleTabChange);

    return () => {
      clearInterval(intervalId);
      chrome.tabs.onActivated.removeListener(handleTabChange);
    };
  }, []);

  return (
    <Container>
      <Box>
        <List>
          <ListItem>
            <ListItemText primary={tabData.title || 'Loading...'} secondary={tabData.videoSrc || 'No video found.'} />
          </ListItem>
        </List>
      </Box>
    </Container>
  );
}

export default App;
