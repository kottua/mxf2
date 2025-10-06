import {type FormEvent, useState} from "react";
import styles from './CreateEmptyObject.module.css';

interface CreateEmptyObjectProps {
    onCreate: (name: string) => void;
}

function CreateEmptyObject({onCreate}: CreateEmptyObjectProps) {
    const [name, setName] = useState("Новий об'єкт");

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onCreate(name);
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Введіть ім'я</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Новий об'єкт"
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                />
            </div>
            <button type="submit" className={styles.button}>Створити</button>
        </form>
    );
}

export default CreateEmptyObject;