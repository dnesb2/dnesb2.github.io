# uvicorn main:app --reload --port 8000
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timezone


# 1. Load your .env file keys
load_dotenv()

#hello

app = FastAPI()

# 2. Setup CORS so your React app (on port 5173) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#hello

# 3. Initialize the Supabase Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

 
@app.get("/data")
def get_rows():
    try:
        # Replace "test_table" with your actual table name from Supabase
        response = supabase.table("users").select("*").execute()
        
        # This returns a list of dictionaries (rows)
        return {"status": "Success", "rows": response.data}
    except Exception as e:
        print("Error: ", str(e))
        return {"status": "Error", "message": str(e)}
    
@app.get("/allListings")
def get_all_listings():
    try:
        response = supabase.table("listings").select("*").execute()
        return {"status": "Success", "rows": response.data}
    except Exception as e:
        print("Error: ", str(e))
        return {"status": "Error", "message": str(e)}

@app.post("/addListing")
async def add_listing(request: Request):
    print("Trying to addListing ")
    try:
        payload = await request.json()
        # This targets the 'listings' table defined in your schema
        response = supabase.table("listings").insert(payload).execute()
        
        if response.data:
            return {"status": "Success", "record": response.data[0]}
        else:
            return {"status": "Error", "message": "Database did not return data"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}


    
@app.delete("/delete/{username}")
def delete_user_test(username: str):
    print(f"DEBUG: Attempting to delete user: {username}") # Check your terminal for this!
    try:
        response = supabase.table("users").delete().ilike("username", username).execute()
        
        # This will tell you if it actually found a row to kill
        print(f"DEBUG: Supabase Response: {response.data}")
        
        return {"status": "Success", "data": response.data}
    except Exception as e:
        print(f"DEBUG: Error: {str(e)}")
        return {"status": "Error", "message": str(e)}


@app.get("/get-user-id/{username}")
def get_user_id(username: str):
    try:
        # Query the 'users' table for the specific username
        response = supabase.table("users").select("id").eq("username", username).maybe_single().execute()
        
        if response.data:
            return {"status": "Success", "user_id": response.data['id']}
        else:
            return {"status": "Error", "message": "User not found"}
            
    except Exception as e:
        return {"status": "Error", "message": str(e)}
    
@app.get("/msgHistory/{username}")
def get_rows(username: str):
    try:
        # Replace "test_table" with your actual table name from Supabase
        response = supabase.table("Messages").select("From_User_id",  "To_User_id", "created_at", "sender:To_User_id!inner(username)", "sender2:From_User_id!inner(username)", count="exact").eq("sender.username", username).order("created_at").execute()
        
        # for row in response.data:
        #     print(row[0], ":", row[1], ":", row[2])
        if response.data:
            seen = set()
            results = []
            for row in response.data:
                key = (row.get("sender2", {}).get("username"), row.get("sender", {}).get("username"))

                if key not in seen:
                    seen.add(key)
                    results.append(row)  # Add to the list if it's unique

            print(response.data)
            
        else:
            print("No Messages")
        # This returns a list of dictionaries (rows)
        return {"status": "Success", "rows": results}
    except Exception as e:
        print("Error: ", str(e))
        return {"status": "Error", "message": str(e)}
    
@app.get("/msgRequests/{username1}/{username2}")
def get_rows(username1: str, username2: str):
    try:
        # Replace "test_table" with your actual table name from Supabase
        response = supabase.table("Messages").select("From_User_id",  "To_User_id", "created_at", "Subject", "Message", "sender:To_User_id!inner(username)", "sender2:From_User_id!inner(username)").eq("sender.username", username1).eq("sender2.username", username2).order("created_at").execute()
        
        # for row in response.data:
        #     print(row[0], ":", row[1], ":", row[2])
        if response.data:
            print(response.data)
            
        else:
            print("No Messages")
        # This returns a list of dictionaries (rows)
        return {"status": "Success", "rows": response.data}
    except Exception as e:
        print("Error: ", str(e))
        return {"status": "Error", "message": str(e)}
    

@app.post("/send-message")
async def send_message(request: Request):
    print("Trying to Save Message")
    try:
        payload = await request.json()
        payload["created_at"] = datetime.now(timezone.utc).isoformat()
        # This targets the 'listings' table defined in your schema
        response = supabase.table("Messages").insert(payload).execute()
        
        if response.data:
            return {"status": "Success", "record": response.data[0]}
        else:
            return {"status": "Error", "message": "Database did not return data"}
    except Exception as e:
        return {"status": "Error", "message": str(e)}
