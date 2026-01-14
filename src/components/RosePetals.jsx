import React, { useEffect, useState } from 'react';
import './RosePetals.css';

const RosePetals = () => {
    const [petals, setPetals] = useState([]);

    useEffect(() => {
        // Generate constant petals
        const petalCount = 30;
        const newPetals = Array.from({ length: petalCount }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 5 + 5 + 's', // 5-10s
            animationDelay: Math.random() * 5 + 's',
            width: Math.random() * 15 + 10 + 'px',
            height: Math.random() * 15 + 10 + 'px',
        }));
        setPetals(newPetals);
    }, []);

    return (
        <div className="rose-petals-container">
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="petal"
                    style={{
                        left: petal.left,
                        animationDuration: petal.animationDuration,
                        animationDelay: petal.animationDelay,
                        width: petal.width,
                        height: petal.height,
                    }}
                />
            ))}
        </div>
    );
};

export default RosePetals;
