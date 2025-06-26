from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import os
from datetime import datetime
import uuid
from typing import Optional

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.proposal_db
proposals_collection = db.proposals
responses_collection = db.responses

class ProposalCreate(BaseModel):
    partner_name: str
    proposer_name: str
    message: str
    our_story: list
    created_at: Optional[datetime] = None

class ProposalResponse(BaseModel):
    proposal_id: str
    response: str  # "yes" or "no"
    message: Optional[str] = None
    responded_at: Optional[datetime] = None

@app.get("/")
async def root():
    return {"message": "Love Proposal API is running!"}

@app.post("/api/proposals")
async def create_proposal(proposal: ProposalCreate):
    """Create a new proposal"""
    try:
        proposal_data = {
            "id": str(uuid.uuid4()),
            "partner_name": proposal.partner_name,
            "proposer_name": proposal.proposer_name,
            "message": proposal.message,
            "our_story": proposal.our_story,
            "created_at": datetime.now(),
            "status": "pending"
        }
        
        result = proposals_collection.insert_one(proposal_data)
        
        return {
            "success": True,
            "proposal_id": proposal_data["id"],
            "message": "Proposal created successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating proposal: {str(e)}")

@app.get("/api/proposals/{proposal_id}")
async def get_proposal(proposal_id: str):
    """Get a specific proposal"""
    try:
        proposal = proposals_collection.find_one({"id": proposal_id})
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        # Remove MongoDB's _id field for JSON serialization
        proposal.pop('_id', None)
        
        return proposal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching proposal: {str(e)}")

@app.post("/api/proposals/{proposal_id}/respond")
async def respond_to_proposal(proposal_id: str, response: ProposalResponse):
    """Respond to a proposal"""
    try:
        # Check if proposal exists
        proposal = proposals_collection.find_one({"id": proposal_id})
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        # Save the response
        response_data = {
            "id": str(uuid.uuid4()),
            "proposal_id": proposal_id,
            "response": response.response.lower(),
            "message": response.message or "",
            "responded_at": datetime.now()
        }
        
        responses_collection.insert_one(response_data)
        
        # Update proposal status
        proposals_collection.update_one(
            {"id": proposal_id},
            {"$set": {"status": "responded", "response": response.response.lower()}}
        )
        
        return {
            "success": True,
            "message": f"Response '{response.response}' recorded successfully!",
            "response_id": response_data["id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording response: {str(e)}")

@app.get("/api/proposals/{proposal_id}/status")
async def get_proposal_status(proposal_id: str):
    """Get proposal status and response"""
    try:
        proposal = proposals_collection.find_one({"id": proposal_id})
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        response = responses_collection.find_one({"proposal_id": proposal_id})
        
        return {
            "proposal_id": proposal_id,
            "status": proposal.get("status", "pending"),
            "response": proposal.get("response"),
            "response_message": response.get("message") if response else None,
            "responded_at": response.get("responded_at") if response else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching status: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)