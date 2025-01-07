import { AuthContext } from "@/components/context/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import useFetchFields, { FieldData } from "@/hooks/use-fetch-fields";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { createRef, useContext, useEffect, useState } from "react";

const FieldCard: React.FC<FieldData> = (props) => {
    const { fieldName, location, price } = props;

    const { toast } = useToast();
    const { user } = useContext(AuthContext);

    const dialogRef = createRef<HTMLButtonElement>();

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [hours, setHours] = useState<number>(0);
    const [priceToPay, setPriceToPay] = useState<number>(0);

    useEffect(() => {
        if (startDate && endDate) {
            let calcHours = Math.ceil((endDate.getTime() - startDate.getTime()) / 36e5);
            if (calcHours < 1) {
                toast({
                    title: "You need to select a valid time.",
                    description: "Please select a valid time.",
                    variant: "destructive"
                });
                setHours(0);
                setPriceToPay(0);
                return;
            }
            setHours(calcHours);
            setPriceToPay(calcHours * price);
        }
    }, [startDate, endDate])
 
    const handleRentClick = () => {
        if (!user) {
            toast({
                title: "You need to be logged in to rent a field.",
                description: "Please sign in or sign up.",
                variant: "destructive"
            });
            return;
        }

        dialogRef.current?.click();
    }

    const performRent = () => {
        if (!user) {
            toast({
                title: "You need to be logged in to rent a field.",
                description: "Please sign in or sign up.",
                variant: "destructive"
            });
            return;
        }

        const owner = user.email;
        addDoc(collection(firestore, "rentals"), {
                fieldName,
                location,
                priceToPay,
                startDate,
                endDate,
                hours,
                owner
        }).then(() => {
            toast(({
                title: "Field rented successfully!",
                description: "You will receive a confirmation email shortly.",
                variant: "default"
            }))
        })
    }

    return (
        <Card className="w-[250px] flex flex-col items-center justify-center p-6 gap-4">
            <CardTitle>{fieldName}</CardTitle>
            <CardContent className="gap-6 flex flex-col items-center w-full">
                <img src="https://placehold.co/600x400" />
                <div>
                    <p className="font-medium">Location: {location}</p>
                    <p className="font-medium">Price: {price} $</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-800" onClick={handleRentClick}>Rent</Button>
                <Dialog>
                    <DialogTrigger className="hidden" ref={dialogRef}/>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rent {fieldName}</DialogTitle>
                            <DialogDescription>Tell us for how long you want to rent this field.</DialogDescription>
                            <DateTimePicker setDate={setStartDate}/>
                            <DateTimePicker setDate={setEndDate}/>
                            {hours >= 1 && <div>
                                <p>Time for rent: {hours} hours</p>
                                <p>Price to pay: {priceToPay} $</p>
                            </div>}
                        </DialogHeader>
                        <DialogFooter>
                            <Button className="bg-teal-600 hover:bg-teal-800" disabled={hours < 1} onClick={performRent}>Rent</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export const FieldsPage: React.FC = () => {
    const { fields, error } = useFetchFields();

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <p className="text-2xl font-semibold">Error: {error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center h-screen bg-gray-50">
            <Toaster />
            <h1 className="text-2xl font-semibold mt-8">Here are some fields you can rent.</h1>
            <div className="grid lg:grid-cols-4 sm:grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {fields.map((field) => <FieldCard {...field} key={field.id} />)}
            </div>
        </div>
    )
}