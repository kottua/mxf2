import {type FormEvent, useState} from "react";
import styles from './CreateEmptyObject.module.css';

interface CreateEmptyObjectProps {
    onCreate: (name: string) => void;
}

function CreateEmptyObject({onCreate}: CreateEmptyObjectProps) {
    const [name, setName] = useState("Новий будинок");

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onCreate(name);
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Введіть назву</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Новий будинок"
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                />
            </div>
            <button type="submit" className={styles.button}>Створити</button>
        </form>
    );
}

export default CreateEmptyObject;
