"use client"; // required for using hooks in Next.js App Router
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Page() {
  const [drugs, setDrugs] = useState([]); // fetches suggestions
  const [selectedDrugs, setSelectedDrugs] = useState([]); // selected drugs
  const [interactions, setInteractions] = useState(null); // int will be null initially
  const [searchTerm, setSearchTerm] = useState(""); // input from user
  const [suggestions, setSuggestions] = useState([]); // current dropdown

  // Debounce logic (waits 300ms after typing stops)
  useEffect(() => {
    const fetchAllDrugs = async () => {
      try {
        const res = await fetch("http://localhost:5000/drugs");
        const data = await res.json();
        setDrugs(data);
      } catch (err) {
        console.error("Error fetching all drugs:", err);
      }
    };
    fetchAllDrugs();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 2) {
        const fetchDrugs = async () => {
          try {
            const res = await fetch(
              `http://localhost:5000/drugs?q=${searchTerm}`
            );
            const data = await res.json();
            setSuggestions(
              data.filter((d) => !selectedDrugs.some((s) => s.id === d.id))
            );
          } catch (err) {
            console.error(err);
          }
        };
        fetchDrugs();
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handler); // cleanup
  }, [searchTerm, selectedDrugs]);

  const checkInteraction = async () => {
    if (selectedDrugs.length < 2) {
      alert("Select at least 2 drugs to check interaction.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ drugs: selectedDrugs.map((d) => d.id) }), // send IDs
      });

      const data = await res.json();
      setInteractions(data);
    } catch (err) {
      console.error("Error checking interaction:", err);
    }
  };

  const drugMap = Object.fromEntries(selectedDrugs.map(d => [Number(d.id), d.name]));

  const severityColors = {
    severe: "#a50a0cff", // maroon red
    high: "#ff4d4f",   // also red, optional
    moderate: "#d3a54aff", //amber
    mild: "#f0f056ff", // lemon yellow
    low: "#52c41a", // green
  };

  // Helper to convert hex to rgba for soft background
  const hexToRgba = (hex, alpha = 0.4) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // defining FAQs
  const faqs = [
  {
    question: "Why is checking drug interactions important?",
    answer: "Drug interactions can significantly alter the effectiveness of medications or lead to unexpected side effects. Some interactions may reduce the therapeutic benefit, while others can increase toxicity. By checking interactions before combining drugs, patients and healthcare providers can prevent adverse events, ensure proper dosing, and optimize treatment outcomes. Awareness of potential interactions is crucial for safety, especially for individuals on multiple medications or with chronic conditions.",
  },
  {
    question: "Can drug interactions affect common medications?",
    answer: "Yes, even widely prescribed or over-the-counter medications can interact with each other. For example, pain relievers, blood thinners, and certain antibiotics may have synergistic or antagonistic effects when combined. These interactions may not always produce immediate symptoms but can lead to long-term health risks. Regularly checking for interactions helps avoid complications and ensures that routine medications are safe when taken together.",
  },
  {
    question: "Do herbal supplements and vitamins cause interactions?",
    answer: "Absolutely. Herbal supplements, vitamins, and even certain foods can interact with prescription medications. For instance, St. John’s Wort can reduce the effectiveness of some antidepressants, while high doses of vitamin K can interfere with blood thinners. It is essential to consider all substances a patient is taking - prescribed, over-the-counter, or natural - to fully assess interaction risk and maintain treatment safety.",
  },
  {
    question: "How do healthcare providers assess interactions?",
    answer: "Healthcare providers use scientific databases, clinical guidelines, and patient history to evaluate potential interactions. They consider factors such as dosage, timing, patient age, organ function, and comorbidities. By systematically assessing these factors, providers can predict, monitor, and mitigate adverse interactions, ensuring that patients receive the maximum benefit from their medications without unnecessary risk.",
  },
  {
    question: "What should patients do to avoid harmful interactions?",
    answer: "Patients should maintain an up-to-date list of all medications, supplements, and over-the-counter products they use. Sharing this list with healthcare providers allows for accurate assessment of potential interactions. Patients should also follow dosing instructions carefully, report unusual symptoms promptly, and use reliable tools or apps to check interactions. Proactive monitoring significantly reduces the risk of adverse effects and ensures safer, more effective treatment.",
  },
];


  const [openFAQ, setOpenFAQ] = useState(null); // keeps track of which FAQ is open

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Drug Interaction Checker</h1>

      <h2>Select Drugs:</h2>

      {/* Display selected drugs as tags */}
      <div className={styles.selectedDrugs}>
        {selectedDrugs.map((drug) => (
          <div key={drug.id} className={styles.tag}>
            {drug.name}
            <span
              className={styles.removeTag}
              onClick={() =>
                setSelectedDrugs(selectedDrugs.filter((d) => d.id !== drug.id))
              }
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search for a drug..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchBox}
      />

      {/* Suggestions dropdown */}
      <div className={styles.suggestions}>
        {suggestions.map((drug) => (
          <div
            key={drug.id}
            className={styles.suggestionItem}
            onClick={() => {
              setSelectedDrugs([...selectedDrugs, drug]); // add to selected
              setSearchTerm(""); // clear input
              setSuggestions([]); // hide dropdown
            }}
          >
            {drug.name}
          </div>
        ))}
      </div>

      {/* Button - to check interaction*/}
      <button className={styles.button} onClick={checkInteraction}>
        Check Interaction
      </button>

      <p>
        Selected Drugs:{" "}
        {selectedDrugs.map((d) => d.name).join(", ") || "None!"}
      </p>

      {/* interaction result */}
      {interactions && (
        <div className={styles.results}>
          <h3>Interactions:</h3>
          {interactions.length > 0 ? (
            interactions.map((i) => {
              const severity = i.severity?.toLowerCase();

              return (
                <div
                  key={i.id}
                  className={`${styles.interactionCard} ${severity}`}
                  style={{
                    borderLeft: `8px solid ${severityColors[severity] || "#ccc"}`,
                    backgroundColor: hexToRgba(
                      severityColors[severity] || "#ccc",
                      0.3
                    ),
                  }}
                >
                  <p>
                    <strong>{drugMap[Number(i.drug1_id)]}</strong> ↔{" "}
                    <strong>{drugMap[Number(i.drug2_id)]}</strong>
                  </p>
                  <p>
                    <strong>Severity:</strong>{" "}
                    <span style={{ color: severityColors[severity] || "#333" }}>
                      {i.severity}
                    </span>
                  </p>
                  <p>{i.description}</p>
                </div>
              );
            })
          ) : (
            <p style={{ color: "green", fontWeight: "bold" }}>
              ✅ No interactions found for the selected drugs.
            </p>
          )}
        </div>
      )}

      {/* FAQ / Info Section */}
      <div className={styles.faqSection}>
        <h3>FAQs</h3>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <div
              className={styles.faqQuestion}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
            >
              {faq.question} <span>{openFAQ === index ? "−" : "+"}</span>
            </div>
            {openFAQ === index && (
              <div className={styles.faqAnswer}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
