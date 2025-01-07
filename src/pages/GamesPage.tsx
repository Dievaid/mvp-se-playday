import React, { useContext, useState, useEffect } from "react";
import GameCard, { Game } from "@/components/GameCard";
import { collection, doc, setDoc, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "@/components/context/auth-provider";
import { Timestamp } from "firebase/firestore";


interface Rental {
    id: string;
    endDate: Timestamp;
    fieldName: string;
    hours: number;
    location: string;
    owner: string;
    priceToPay: number;
    startDate: Timestamp;
}

function GamesPage() {
  const [games, setUserGames] = useState<Game[]>([]);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [gameData, setGameData] = useState({
    title: "",
    description: "",
    gameType: "",
    playersNeeded: 0,
    creator: "",
    date: "",
    duration: 0,
    rentalId: "",
    id: "",
    joinedPlayers: [],
  });
  const [rentals, setRentals] = useState<Rental[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const gamesRef = collection(firestore, "games");
      const q = query(gamesRef);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userGames = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Game),
          id: doc.id,
        }));
        setUserGames(userGames);
      });

      const rentalsRef = collection(firestore, "rentals");
      const rentalQuery = query(rentalsRef, where("owner", "==", user.email));

      const rentalUnsubscribe = onSnapshot(rentalQuery, (querySnapshot) => {
        const rentalData = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Rental),
        }));
        setRentals(rentalData);
      });
      

      return () => {
        unsubscribe();
        rentalUnsubscribe();
      };
    }
  }, [user]);

  const handleAddGame = () => setShowAddGameModal(true);
  const handleCloseModal = () => {
    setShowAddGameModal(false);
    setGameData({ title: "", description: "", gameType: "", playersNeeded: 0, creator: "", date: "", duration: 0, rentalId: "", id: "", joinedPlayers: [] });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setGameData({ ...gameData, [e.target.name]: e.target.value });
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameData.gameType || !gameData.playersNeeded || !gameData.rentalId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const uniqueID = uuidv4();

      const selectedRental = rentals.find((rental) => rental.owner === user?.email);
      console.log(rentals);
      console.log(selectedRental);

      if (!selectedRental) {
        alert("Invalid rental selected.");
        return;
      }

      await setDoc(doc(collection(firestore, "games"), uniqueID), {
        ...gameData,
        id: uniqueID,
        creator: user?.email,
        date: selectedRental.startDate,
        duration: selectedRental.hours,
        rentalId: gameData.rentalId,
        createdAt: new Date(),
        joinedPlayers: [user?.email],
      });

      alert("Game added successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error adding game: ", error);
      alert("Failed to add the game. Please try again.");
    }
  };

  const buttonClass =
    "px-8 py-3 bg-[#065C64] text-white text-lg font-medium rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105";

    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center p-2 bg-gray-50 h-full">
          <h1 className="text-2xl font-semibold text-[#065C64] flex-grow text-center">Games</h1>
          <button
            className={buttonClass}
            onClick={handleAddGame}
          >
            Add Game
          </button>
        </div>
    
        <div className="flex flex-col items-center h-screen bg-gray-50">
          <div className="grid lg:grid-cols-4 sm:grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
    
        {showAddGameModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-2/5 text-[#065C64]">
              <h2 className="text-2xl font-bold mb-4">Add New Game</h2>
              <form onSubmit={handleSaveGame}>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={gameData.title}
                  onChange={handleInputChange}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="gameType"
                  placeholder="Game Type"
                  value={gameData.gameType}
                  onChange={handleInputChange}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={gameData.description}
                  onChange={handleInputChange}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  name="playersNeeded"
                  placeholder="Players Needed"
                  value={gameData.playersNeeded}
                  onChange={handleInputChange}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <select
                  name="rentalId"
                  value={gameData.rentalId}
                  onChange={handleInputChange}
                  className="w-full mb-4 p-2 border border-gray-300 rounded hover:text-[#065C64]"
                >
                  <option value="">Select Rental</option>
                  {rentals.map((rental) => (
                    <option key={rental.id} value={rental.id}>
                      {rental.fieldName} on {rental.startDate.toDate().toLocaleDateString()} starting at {rental.startDate.toDate().getHours()} for {rental.hours} hours
                    </option>
                  ))}
                </select>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-[#065C64] text-white rounded">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );    
}

export default GamesPage;
