import { useState, useEffect } from 'react';
import './App.css';
const API_URL = "http://127.0.0.1:8000";
const TAGS = ["Fresh",
			  "Packaged",
			  "Frozen",
			  "Mexican",
			  "Chinese",
			  "Italian",
			  "Homemade",
			  "Restaurant",
			  "Store-bought"]
			  


/*
Logic functions 
 */
/**
 * Calculates the distance between two sets of coordinates in miles.
 * @param {number} lat1 - User Latitude
 * @param {number} lon1 - User Longitude
 * @param {number} lat2 - Listing Latitude
 * @param {number} lon2 - Listing Longitude
 * @returns {string|null} - Distance in miles rounded to 1 decimal place
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(1); // Returns distance like "0.5"
};

const handleDelete = (username, items, setItems) => {
  fetch(`http://127.0.0.1:8000/delete/${username}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.status === "Success") {
        setItems(items.filter(item => item.username !== username));
      }
    })
    .catch(err => console.error("Delete failed:", err));
};



/*
 MAIN APP: Controls the "State Machine" and Layout
 */
function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); //to select & store username for the chat component
  const [currentScreen, setCurrentScreen] = useState('HOME'); // FSM State

  useEffect(() => {
    fetch(`${API_URL}/data`)
      .then(res => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then(data => setItems(data.rows || []))
      .catch(err => {
        setError(err.message);
        setItems([{ username: "Sample Item 1" }, { username: "Sample Item 2" }]);
      });
  }, []);

  return (
    <div className="vbox" style={{
      padding: '5em',
      minHeight: '100vh',
      fontFamily: 'Arial',
      background: 'rgba(57, 54, 70, 0.66)',
      color: 'white'
    }}>
      {/* Header Section */}
      <header>
        <h1>Group 10's Community Bite Project</h1>
        <h5>By: Rudhva, Gabe, Davon, Shreyas</h5>
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      </header>

      <hr style={{ width: '100%', opacity: 0.2 }} />

      {/* Screen Switcher (FSM) */}
      {/* Inside App.jsx - The Switcher */}
      <main style={{ width: '100%' }}>
        {currentScreen === 'HOME' && (
          <HomeScreenView setScreen={setCurrentScreen} items={items} setItems={setItems} />
        )}
        {currentScreen === 'ALL_LISTINGS' && (
          <AllListingsView setScreen={setCurrentScreen} />
        )}
        {currentScreen === 'CHAT' && (
          <ChatView setScreen={setCurrentScreen} />
        )}
        {currentScreen === 'CREATE_LISTING' && (
          <CreateListingsView setScreen={setCurrentScreen} />
        )}
        {currentScreen === 'DETAILED_LISTING' && (
          <DetailedListingView setScreen={setCurrentScreen} />
        )}
        {currentScreen === 'SENDMSG' && (
          <SendMessage setScreen={setCurrentScreen} items={items} setItems={setItems} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        )}
        {currentScreen === 'CHATSEND' && (
          <ChatSend setScreen={setCurrentScreen} selectedItem={selectedItem} />
        )}
        {currentScreen === 'INBOX' && (
          <CheckInbox setScreen={setCurrentScreen} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        )}
        {currentScreen === 'CHECKMSG' && (
          <CheckMessageList setScreen={setCurrentScreen} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        )}
        {currentScreen === 'REPLYSCREEN' && (
          <ReplyMessage setScreen={setCurrentScreen} items={items} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        )}

      </main>
    </div >
  );
}

/**
 * SCREEN: HomeScreen Component
 */
function HomeScreenView({ items, setItems, setScreen }) {
  return (
    <div className="vbox">
      <h2 style={{ color: 'cadetblue' }}>Dashboard</h2>

      <div className="hbox">
        {/* Just change the string to change the screen! */}
        <button onClick={() => setScreen('ALL_LISTINGS')}>
          All Listings (T1)
        </button>

        <button onClick={() => setScreen('DETAILED_LISTING')}>
          Detailed Listings (T2)
        </button>

        <button onClick={() => setScreen('CHAT')}>
          Chat (T3)
        </button>

        <button onClick={() => setScreen('CREATE_LISTING')}>
          Create New Listing (T4)
        </button>
      </div>

      {/* The List Container */}
      <div className="hbox" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.map((item, index) => (
          <UserCard
            key={index}
            item={item}
            onDelete={() => handleDelete(item.username, items, setItems)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * COMPONENT: Individual User Card -- this was just to test the connection to the database, ignore for now (don't delete tho)
 */
function UserCard({ item, onDelete }) {
  return (
    <div className="card" style={{ background: '#4a475a', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
      <h3 style={{ fontFamily: 'Times New Roman', textAlign: 'center', margin: '0' }}>
        Username: {item.username}
      </h3>
      <p>UUID: {item.id}</p>
      <button
        onClick={onDelete}
        style={{ backgroundColor: '#cc4e4e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', width: '100%' }}>
        Delete User
      </button>
    </div>
  );
}

//user list for chat component
function UserCardMsg({ item, setScreen, setSelectedItem }) {
  return (
    <div className="card" style={{ background: '#4a475a', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
      <h3 style={{ fontFamily: 'Times New Roman', textAlign: 'center', margin: '0' }}>
        Username: {item.username}
      </h3>
      <p>UUID: {item.id}</p>
      <button
        onClick={() => {
          setSelectedItem(item);
          setScreen('CHATSEND');
        }}
        style={{ backgroundColor: '#cc4e4e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', width: '100%' }}>

        Select User
      </button>
    </div>
  );
}

//user list for chat component
function UserCardRp({ item, setScreen, selectedItem, setSelectedItem }) {
  return (
    <div className="card" style={{ background: '#4a475a', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
      <h3 style={{ fontFamily: 'Times New Roman', textAlign: 'center', margin: '0' }}>
        Username: {item.sender2.username}
      </h3>
      <p>UUID: {item.From_User_id}</p>
      <button
        onClick={() => {
          setSelectedItem(item);

          setScreen('CHECKMSG');
        }}
        style={{ backgroundColor: '#cc4e4e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', width: '100%' }}>

        View Messages
      </button>
    </div>
  );
}

//user list for chat component
function UserCardMsgLst({ item, setScreen, selectedItem, setSelectedItem }) {
  //const date = item.created_at;
  const isoString = item.created_at;
  const date = new Date(isoString);
  const timeStr = date.toLocaleString()

  console.log(timeStr);



  return (
    <div className="card" style={{ background: '#4a475a', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
      <h3 style={{ fontFamily: 'Times New Roman', textAlign: 'center', margin: '0' }}>
        Username: {selectedItem.sender2.username}
      </h3>
      <div className="hbox">
        <p style={{ textAlign: 'left' }}><strong>Date:</strong>   {timeStr}</p>
        <p style={{ textAlign: 'left' }}><strong>Subject:</strong>   {item.Subject}</p>

        <p style={{ textAlign: 'left' }}><strong>Message:</strong> {item.Message}</p>
        <button
          onClick={() => {
            setSelectedItem(item);

            setScreen('REPLYSCREEN');
          }}
          style={{ backgroundColor: '#cc4e4e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', width: '100%' }}>

          Reply
        </button>
      </div>


    </div>
  );
}

//component for sending reply message
function ReplyMessage({ item, selectedItem, setScreen, setSelectedItem }) {
  const subj = selectedItem.Subject;
  const replySubject = "Re: " + subj;
  const [Message, setmsg] = useState('');
  const [Subject, setsubjt] = useState('');
  //const [status, setStatus] = useState('available');

  const handleSubmit = async () => {

    //setToUser(selectedItem.username);
    try {
      // Use port 8080 to match your uvicorn command
      //const idResponse = await fetch(`{http://127.0.0.1:8000}/get-user-id/${userNameInput}`);
      const idResponse = await fetch(`${API_URL}/get-user-id/${'steve'}`);
      const idData = await idResponse.json();

      if (idData.status !== "Success") {
        alert("User A not found! Please enter a valid username (e.g., Rudhva, Gabe).");
        return;
      } else {
        //alert("User A found!");
      }


      const secidResponse = await fetch(`${API_URL}/get-user-id/${selectedItem.sender2.username}`);
      const secidData = await secidResponse.json();

      if (idData.status !== "Success") {
        alert("User B not found! Please enter a valid username (e.g., Rudhva, Gabe).");
        return;
      } else {
        //alert("User B found!");
      }

      const payload = {
        From_User_id: idData.user_id, // Correctly grabs the UUID from your backend
        //from_user = 
        To_User_id: secidData.user_id,
        Subject: replySubject,
        Message: Message,
        //status: status
      };

      console.log("Payload before sending:", payload); // Add this line to check the values
      const postResponse = await fetch(`${API_URL}/send-message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const postData = await postResponse.json();
      if (postData.status === "Success") {
        alert("Message Sent!");
        setScreen('HOME');
      }
    } catch (err) {
      console.error("Submission failed:", err);
    }


  };




  return (
    <div className="vbox" >
      <h2>Username: {selectedItem.sender2.username}</h2>
      <div className="hbox">
        <label><strong> Subject:  </strong ></label>
        <label style={{ padding: "10px" }}>{replySubject}</label>
      </div>

      <div className="hbox">
        <label> <strong>Message: </strong></label>
        <textarea style={{ height: "150px", width: "300px", padding: "8px", verticalAlign: "top", resize: "none" }}
          type="text" value={Message} onChange={(e) => setmsg(e.target.value)} />
      </div>
      <div className="hbox">
        <button onClick={handleSubmit} style={{ marginLeft: "80px", marginRight: "10px" }}> Send Message</button>
      </div>


    </div>
  );
}


/**
 * COMPONENT: Image Upload test -- this was just to test if user can uplaod an image, ignore for now (don't delete tho)
 */
function ImageUpload({ setScreen }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (file) {
      // 1. Check file size
      if (file.size > MAX_SIZE) {
        alert("File is too big! Please select a JPEG under 5MB.");
        return;
      }

      // 2. Create a temporary URL to display the image
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>
        ← Back to Home
      </button>
      <div className="vbox" style={{ gap: '10px', padding: '20px', border: '1px dashed #ccc' }}>
        <label>Upload Listing Photo (JPEG, max 5MB):</label>

        <input
          type="file"
          accept="image/jpeg"
          onChange={handleFileChange}
        />

        {/* 3. Display the image once it's uploaded/selected */}
        {preview && (
          <div className="vbox">
            <p>Preview:</p>
            <img
              src={preview}
              alt="Upload Preview"
              style={{ width: '200px', borderRadius: '8px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ item, userCoords }) {
  // Calculate distance using the item's lat/long from Supabase and the viewer's GPS
  const distance = (userCoords && item.latitude && item.longitude) 
    ? calculateDistance(userCoords.lat, userCoords.lng, item.latitude, item.longitude) 
    : null;

  return (
    <div className="card" style={{ background: '#4a475a', padding: '20px', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
      <p><strong>Food:</strong> {item.food_name}</p>
      
      {/* New Distance Element */}
      {distance ? (
        <p style={{ color: '#4ecdc4', fontWeight: 'bold', margin: '5px 0' }}>
          📍 {distance} miles away
        </p>
      ) : (
        <p style={{ fontSize: '12px', opacity: 0.5 }}>Location unavailable</p>
      )}

      <p>Desc: {item.food_desc}</p>
      <p>Status: {item.status}</p>
      <p style={{ fontSize: '10px', opacity: 0.4 }}>{item.id}</p>
    </div>
  );
}

function AllListingsView({ setScreen }) {
  const [result, setResult] = useState([]);
  const [userCoords, setUserCoords] = useState(null); // New state for viewer's location

  useEffect(() => {
    // 1. Get the viewer's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error("Location access denied", err)
      );
    }

    // 2. Fetch listings (Existing logic)
    fetch(`${API_URL}/allListings`)
      .then(res => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then(data => setResult(data.rows || []))
      .catch(err => console.error(err.message));
  }, []);

  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>← Back to Home</button>
      <h2>All Listings</h2>
      <div className="hbox" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {result.map((obj, index) => (
          <ListingCard 
            key={index} 
            item={obj} 
            userCoords={userCoords} // Pass user location down
          />
        ))}
      </div>
    </div>
  );
}

function DetailedListingView({ setScreen }) {
  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>← Back to Home</button>
      <h2>Detailed Listing View</h2>
    </div>
  );
}

//chat select screen
function ChatView({ setScreen }) {
  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>← Back to Home</button>
      <h2>Chat</h2>
      <button onClick={() => setScreen('SENDMSG')}> Send a Message</button>
      <button onClick={() => setScreen('INBOX')}> check Inbox</button>
    </div>
  );
}

//send meesage user list display screen
function SendMessage({ setScreen, items, setItems, selectedItem, setSelectedItem }) {
  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>← Back to Home</button>
      <h2>Select Username</h2>
      <div className="hbox" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.map((item, index) => (
          <UserCardMsg
            key={index}
            item={item}
            setScreen={setScreen}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        ))}
      </div>
    </div>

  )
}

function CheckInbox({ setScreen, selectedItem, setSelectedItem }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  //const [selectedItem, setSelectedItem] = useState(null); //to select & store username for the chat component
  const [currentScreen, setCurrentScreen] = useState('HOME'); // FSM State
  const [amount] = useState('0');


  useEffect(() => {
    fetch(`${API_URL}/msgHistory/${'steve'}`)
      .then(res => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then(data => setItems(data.rows || []))
      .catch(err => {
        setError(err.message);
        setItems([{ username: "Sample Item 1" }, { username: "Sample Item 2" }]);
      });
  }, []);
  const sss = `You have ${items.length} messages`;
  return (
    <div className="vbox">
      <button onClick={() => setScreen('CHECKMSG')}>← Back to Home</button>
      <h2>{sss}</h2>
      <div className="hbox" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.map((item, index) => (
          <UserCardRp
            key={index}
            item={item}
            amount={index}
            setScreen={setScreen}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />

        ))}
      </div>
    </div>

  )
}




//chat ui to send messages screen
function ChatSend({ selectedItem, setScreen }) {
  if (!selectedItem) return <div>No item selected</div>;
  const [to_user] = useState('');
  //const [from_user] = useState('');
  const [Subject, setsubjt] = useState('');
  const [Message, setmsg] = useState('');
  //const [status, setStatus] = useState('available');

  const handleSubmit = async () => {

    //setToUser(selectedItem.username);
    try {
      // Use port 8080 to match your uvicorn command
      //const idResponse = await fetch(`{http://127.0.0.1:8000}/get-user-id/${userNameInput}`);
      const idResponse = await fetch(`${API_URL}/get-user-id/${'steve'}`);
      const idData = await idResponse.json();

      if (idData.status !== "Success") {
        alert("User A not found! Please enter a valid username (e.g., Rudhva, Gabe).");
        return;
      } else {
        //alert("User A found!");
      }


      const secidResponse = await fetch(`${API_URL}/get-user-id/${selectedItem.username}`);
      const secidData = await secidResponse.json();

      if (idData.status !== "Success") {
        alert("User B not found! Please enter a valid username (e.g., Rudhva, Gabe).");
        return;
      } else {
        //alert("User B found!");
      }

      const payload = {
        From_User_id: idData.user_id, // Correctly grabs the UUID from your backend
        //from_user = 
        To_User_id: secidData.user_id,
        Subject: Subject,
        Message: Message,
        //status: status
      };

      console.log("Payload before sending:", payload); // Add this line to check the values
      const postResponse = await fetch(`${API_URL}/send-message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const postData = await postResponse.json();
      if (postData.status === "Success") {
        alert("Message Sent!");
        setScreen('HOME');
      }
    } catch (err) {
      console.error("Submission failed:", err);
    }


  };



  return (
    <div className="vbox">
      <h2>Send Message</h2>

      <h2>User: {selectedItem.username}</h2>
      <div className="hbox" >
        <label style={{ marginRight: "10px" }}> <strong>Subject: </strong></label>
        <input type="text" value={Subject} onChange={(e) => setsubjt(e.target.value)} style={{ minWidth: '310px' }} />
      </div>

      <div className="hbox">
        <label> <strong>Message: </strong></label>
        <textarea style={{ height: "150px", width: "300px", padding: "8px", verticalAlign: "top", resize: "none" }}
          type="text" value={Message} onChange={(e) => setmsg(e.target.value)} />
      </div>

      <div className="hbox" style={{ marginTop: "10px" }}>
        <button style={{ marginLeft: "80px", marginRight: "10px" }} onClick={handleSubmit}>
          Send Message
        </button>
        <button onClick={() => setScreen('HOME')}>
          Back
        </button>

      </div>


    </div>
  );
}

function CheckMessageList({ setScreen, selectedItem, setSelectedItem }) {
  if (!selectedItem) return <div>No item selected</div>;
  console.log(selectedItem.sender2.username);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  //const [selectedItem, setSelectedItem] = useState(null); //to select & store username for the chat component
  const [currentScreen, setCurrentScreen] = useState('HOME'); // FSM State
  const [amount] = useState('0');


  useEffect(() => {
    fetch(`${API_URL}/msgRequests/${'steve'}/${selectedItem.sender2.username}`)
      .then(res => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then(data => setItems(data.rows || []))
      .catch(err => {
        setError(err.message);
        setItems([{ username: "Sample Item 1" }, { username: "Sample Item 2" }]);
      });
  }, []);

  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>← Back to Home</button>
      <h2>Messages From: {selectedItem.sender2.username}</h2>
      <div className="hbox" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.map((item, index) => (
          <UserCardMsgLst
            key={index}
            item={item}
            setScreen={setScreen}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />

        ))}
      </div>
    </div>
  );
}

/**
 * COMPONENT: Image Upload test -- this was just to test if user can uplaod an image, ignore for now (don't delete tho)
 */
function CreateListingsView({ setScreen }) {
  const [userNameInput, setUserNameInput] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [status, setStatus] = useState('available');
  const [tags,setTags] = useState([]);
  function toggleTag(tag){
  	let temp = Array.from(tags)
  	if (temp.indexOf(tag) === -1){
  		temp.push(tag)
  	} else {
  		temp = temp.filter(item => item !== tag)
  	}
  	setTags(temp)
  	console.log(temp);
  }

  const handleSubmit = async () => {
    // Request browser geolocation
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const idResponse = await fetch(`${API_URL}/get-user-id/${userNameInput}`);
        const idData = await idResponse.json();

        if (idData.status !== "Success") {
          alert("User not found!");
          return;
        }

        const payload = {
          donator: idData.user_id,
          food_name: foodName,
          food_desc: foodDesc,
          status: status,
          latitude: latitude,
          longitude: longitude,
          tags: tags
        };

        const postResponse = await fetch(`${API_URL}/addListing/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const postData = await postResponse.json();
        if (postData.status === "Success") {
          alert("Listing Added Successfully!");
          setScreen('HOME');
        }
      } catch (err) {
        console.error("Submission failed:", err);
      }
    });
  };

  return (
    <div className="vbox">
      <button onClick={() => setScreen('HOME')}>← Back to Home</button>
      <div className="vbox" style={{ gap: '10px', padding: '20px', border: '1px dashed #ccc' }}>
        <label>Enter Donator Username:</label>
        <input
          type="text"
          value={userNameInput} // Fixed from donatorId
          onChange={(e) => setUserNameInput(e.target.value)} // Fixed from setDonatorId
          placeholder="e.g. Rudhva"
        />

        <label>Food Name:</label>
        <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} />

        <label>Enter Food Description:</label>
        <input type="text" value={foodDesc} onChange={(e) => setFoodDesc(e.target.value)} />

        <label>Enter Food Status:</label>
        <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
        
        <label display="inline">Add tags (optional):</label>
        <div>{
        		Array.from(TAGS).map(
        			(currentValue) => (<div><input type="checkbox" item={currentValue} onClick={() => toggleTag(currentValue)}/>{currentValue}</div>)
        		)
        }</div>

        <button onClick={handleSubmit} style={{ marginTop: '20px', backgroundColor: 'cadetblue', color: 'white' }}>
          Submit Listing
        </button>
      </div>
    </div>
  );
}

export default App;
