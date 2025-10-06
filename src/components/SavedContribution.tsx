import React from 'react';
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

interface SavedContributionProps {
    contributions: DistributionConfig[];
}

function SavedContribution({contributions}: SavedContributionProps) {

    if (contributions.length === 0) {
        return <p>Немає збережених конфігурацій.</p>;
    }

    return (
        <section>
            <h2>Збережені конфігурації</h2>

        </section>
    );
}

export default SavedContribution;