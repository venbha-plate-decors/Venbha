import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@radix-ui/react-icons'; // Using Radix UI icons as checking package.json in thought, it's available or commonly used. If not I will use 'v' or SVG.
// Actually checking package.json from previous turn (Step 9), @radix-ui/react-icons IS installed.
import './FAQ.css';

const faqData = [
    {
        id: 1,
        question: "Can I customize the plate designs to match my wedding outfit?",
        answer: "Absolutely! We love creating cohesive themes. Just share a picture of your saree or outfit, and we'll design plates that complement your look perfectly, ensuring every detail of your special day is synchronized."
    },
    {
        id: 2,
        question: "How far in advance should I place my order?",
        answer: "We recommend booking at least 2 weeks in advance. This gives us enough time to source the freshest materials and handcraft every detail to perfection without any rush."
    },
    {
        id: 3,
        question: "Do you provide delivery services?",
        answer: "Yes, we do. We carefully pack and deliver the plates to your venue or home. For outstation orders, we use secure courier partners to ensure they reach you safely and in pristine condition."
    },
    {
        id: 4,
        question: "What if I have a specific design in mind that's not in your catalogue?",
        answer: "We thrive on creativity! Show us your inspiration—whether it's from Pinterest or a doodle on a napkin—and we'll bring it to life with our unique Venbha touch."
    },
    {
        id: 5,
        question: "Do you decorate plates for events other than weddings?",
        answer: "Definitely! While weddings are our specialty, we craft beautiful plate decors for engagements, baby showers (seemantham), house warming ceremonies, and corporate cultural events too."
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="faq-section">
            <div className="container">
                <motion.h2
                    className="faq-heading"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    Common Questions
                </motion.h2>

                <div className="faq-list">
                    {faqData.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span>{item.question}</span>
                                <motion.div
                                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="faq-icon"
                                >
                                    <ChevronDownIcon width={24} height={24} />
                                </motion.div>
                            </div>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="faq-answer-wrapper"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="faq-answer">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
