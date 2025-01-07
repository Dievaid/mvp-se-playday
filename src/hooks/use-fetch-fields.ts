import { firestore } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export interface FieldData {
    id: string;
    owner: string;
    price: number;
    location: string;
    fieldName: string;
    createdAt: Date;
    description: string;
}

export default function useFetchFields() {
    const [fields, setFields] = useState<FieldData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let fields: FieldData[] = [];

        getDocs(collection(firestore, "fields")).then((data) => {
            data.forEach((doc) => fields.push(doc.data() as FieldData));
        })
        .then(() => setFields(fields))
        .catch((error) => setError(error.message));
    }, []);

    return { fields, error };
}