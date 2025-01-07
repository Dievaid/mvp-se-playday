import React, { useState, useEffect, useContext } from "react";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { firestore } from "../lib/firebase";
import { AuthContext } from "./context/auth-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardTitle } from "./ui/card";

export interface Game {
  id: string;
  title: string;
  description: string;
  gameType: string;
  playersNeeded: number;
  creator: string;
  rentalId: string;
  date: Timestamp;
  duration: number;
  joinedPlayers: string[];
}

export interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [gameData, setGameData] = useState<Game>(game);
  const {user} = useContext(AuthContext);

  useEffect(() => {
    setGameData(game);
  }, [game]);

  const handleJoinGame = async () => {
    try {
      const updatedGameData = { 
        ...gameData, 
        playersNeeded: gameData.playersNeeded - 1, 
        joinedPlayers: [...gameData.joinedPlayers, user?.email].filter((email): email is string => email !== null && email !== undefined) 
      };

      await updateDoc(doc(firestore, "games", gameData.id), updatedGameData);
      
      setGameData(updatedGameData);

      alert("Joined the game!");
    } catch (error) {
      console.error("Error joining game: ", error);
      alert("Failed to join the game. Please try again.");
    }
  };

  const isAvailable = gameData.playersNeeded > 0 && !gameData.joinedPlayers.includes(user?.email || "");

  return (
	<Card className="w-[250px] flex flex-col items-center justify-between p-6 gap-4">
	  <CardTitle>{gameData.title}</CardTitle>
	  <CardContent className="gap-6 flex flex-col items-center w-full">
		<p className="text-gray-700 mt-2">{gameData.description}</p>
  
		<div className="mt-4 w-full">
		  <p className="text-gray-600 font-medium">Creator: <span className="font-normal">{gameData.creator}</span></p>
		  <p className="text-gray-600 font-medium">Game Type: <span className="font-normal">{gameData.gameType}</span></p>
		  <p className="text-gray-600 font-medium">Players Needed: <span className="font-normal text-green-500">{gameData.playersNeeded}</span></p>
		  <p className="text-gray-600 font-medium">When and where: <span className="font-normal text-blue-500">{gameData.rentalId}</span></p>
		</div>
  
		<div className="mt-auto w-full flex justify-center">
		  {isAvailable ? (
			<Button 
			  className="bg-teal-600 hover:bg-teal-800 w-full" 
			  onClick={handleJoinGame}
			>
			  Join Game
			</Button>
		  ) : (
			<Button 
			  className="w-full bg-gray-300 text-gray-700 rounded-full cursor-not-allowed" 
			  disabled
			>
			  Not Available
			</Button>
		  )}
		</div>
	  </CardContent>
	</Card>
  );  
};

export default GameCard;
