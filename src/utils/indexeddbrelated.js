            
            async function addFilesToIndexedDB(files) {
                const openRequest = indexedDB.open('MyDatabase', 1);
              
                // Promisify the onupgradeneeded event
                const onUpgradeNeeded = (event) => {
                  const db = event.target.result;
              
                  // if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { autoIncrement: true });
                  // }
                };
              
                openRequest.onupgradeneeded = onUpgradeNeeded;
              
                // Wrap the opening of the database in a promise
                const db = await new Promise((resolve, reject) => {
                  openRequest.onsuccess = (event) => resolve(event.target.result);
                  openRequest.onerror = (event) => reject(event.target.error);
                });
              
                // Assuming you have an array of file inputs
                for (const file of files) {
              
                  // Open a transaction to the 'files' object store with readwrite access
                  const transaction = db.transaction(['files'], 'readwrite');
              
                  // Access the 'files' object store
                  const objectStore = transaction.objectStore('files');
              
                  // Promisify the add operation
                  const addFile = (file) => new Promise((resolve, reject) => {
                    const request = objectStore.add(file);
              
                    request.onsuccess = (event) => resolve(event.target.result);
                    request.onerror = (event) => reject(event.target.error);
                  });
              
                  // Add each file to the object store
                  for (const file of files) {
                    try {
                      const fileId = await addFile(file);
                      console.log('File added to IndexedDB:', fileId);
                    } catch (error) {
                      console.error('Error adding file to IndexedDB:', error);
                    }
                  }
                }
              }
              
              async function getFilesFromIndexedDB() {
                const openRequest = indexedDB.open('MyDatabase', 1);
              
                // Promisify the onupgradeneeded event
                const onUpgradeNeeded = (event) => {
                  const db = event.target.result;
              
                  if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { autoIncrement: true });
                  }
                };
              
                openRequest.onupgradeneeded = onUpgradeNeeded;
              
                // Wrap the opening of the database in a promise
                const db = await new Promise((resolve, reject) => {
                  openRequest.onsuccess = (event) => resolve(event.target.result);
                  openRequest.onerror = (event) => reject(event.target.error);
                });
              
                // Open a transaction to the 'files' object store with readonly access
                const transaction = db.transaction(['files'], 'readonly');
              
                // Access the 'files' object store
                const objectStore = transaction.objectStore('files');
              
                // Promisify the getAll operation
                const getAllFiles = () => new Promise((resolve, reject) => {
                  const request = objectStore.getAll();
              
                  request.onsuccess = (event) => resolve(event.target.result);
                  request.onerror = (event) => reject(event.target.error);
                });
              
                try {
                  const files = await getAllFiles();
              
                  if (files.length > 0) {
                    // Use the retrieved array of files as needed
                    return files;
                    console.log('Retrieved files:', files);
                  } else {
                    console.log('No files found.');
                  }
                } catch (error) {
                  console.error('Error retrieving files from IndexedDB:', error);
                }
              }
              