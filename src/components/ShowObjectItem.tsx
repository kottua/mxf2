import styles from './ShowObjectItem.module.css';
import type {MouseEvent} from "react";

interface ShowObjectItemProps {
    id: number;
    name: string;
    created: string;
    onClick: (id: number) => void;
    onDelete: (id: number) => void;
}

function ShowObjectItem({id, name, created, onClick, onDelete}: ShowObjectItemProps) {
    const formattedDate = new Date(created).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    function handleClick(){
        onClick(id);
    }

    function handleDelete(e: MouseEvent){
        e.stopPropagation();
        onDelete(id);
    }

    return (
        <section className={styles.objectCard} onClick={handleClick}>
            <dl className={styles.dl}>
                <dt className={styles.dt}>Назва</dt>
                <dd className={`${styles.dd} ${styles.name}`}>
                    {name}
                </dd>
                <dt className={styles.dt}>Створено</dt>
                <dd className={`${styles.dd} ${styles.date}`}>
                    {formattedDate}
                </dd>
            </dl>
            <button className={styles.deleteButton} onClick={handleDelete}>
                Видалити
            </button>
        </section>
    );
}

export default ShowObjectItem;