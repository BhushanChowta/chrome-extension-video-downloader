import React, { useState, useEffect } from 'react';
import { Container, Box, List, ListItem, ListItemText } from '@mui/material';

function App() {
  const [tabData, setTabData] = useState({});

  const fetchData = () => {
    chrome.tabs.query({}, tabs => {
      const tabUrls = tabs.reduce((result, tab) => {
        result[tab.id] = new URL(tab.url).hostname;
        return result;
      }, {});

      chrome.runtime.sendMessage({ cmd: 'getTabTimes' }, response => {
        const urlTimes = Object.keys(response).reduce((result, tabId) => {
          const url = tabUrls[tabId];
          if (url) {
            if (!result[url]) {
              result[url] = 0;
            }
            result[url] += response[tabId];
          }
          return result;
        }, {});

        setTabData(urlTimes);
      });
    });
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000); // fetch every 5 seconds

    // cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Container>
      <Box>
        <List>
          {Object.keys(tabData).map((url) => (
            <ListItem key={url}>
              <ListItemText primary={url} secondary={`${tabData[url]} seconds`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default App;