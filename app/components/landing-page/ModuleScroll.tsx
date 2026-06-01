"use client";
import { useState, useEffect, useRef } from "react";

export default function ModuleScroll({ offset = 0 }: { offset?: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetModules = [...modules.slice(offset), ...modules.slice(0, offset)];

  return (
    <div ref={outerRef} className="w-full overflow-hidden">
      <div ref={innerRef} className="flex gap-3 py-2 w-max animate-scroll-left">
        {offsetModules.map((mod, i) => (
          <div
            key={`${mod}-${i}`}
            className="px-4 py-2 rounded-md bg-terra-100 text-sm font-medium whitespace-nowrap transition-colors shrink-0"
          >
            {mod}
          </div>
        ))}
      </div>
    </div>
  );
}

const modules = [
  "MA2104 Multivariable Calculus",
  "CS2103T Software Engineering",
  "PH1101E Introduction to Philosophy",
  "EE2026 Digital Design",
  "GEA1000 Quantitative Reasoning with Data",
  "SC1101E Making Sense of Society",
  "ME2134 Fluid Mechanics",
  "CS2040S Data Structures and Algorithms",
  "ST2334 Probability and Statistics",
  "HY1101E Asia and the Modern World",
  "CG1111A Engineering Principles and Practice I",
  "DTK1234 Design Thinking",
  "MA1522 Linear Algebra for Computing",
  "EL1101E The Nature of Language",
  "CS2109S Introduction to AI and ML",
  "CE2155 Structural Mechanics and Materials",
  "ACC1701X Accounting for Decision Makers",
  "MA2001 Linear Algebra I",
  "EE2211 Introduction to Machine Learning",
  "PS1101E Introduction to Politics",
  "CS3230 Design and Analysis of Algorithms",
  "HSA1000 Asian Interconnections",
  "ME2112 Strength of Materials",
  "ST2131 Probability",
  "PL1101E Introduction to Psychology",
  "CS2030S Programming Methodology II",
  "BN2102 Bioengineering Data Analysis",
  "GEN2000 Communities and Engagement",
  "MA2108 Mathematical Analysis I",
  "EE2028 Microcontroller Programming and Interfacing",
  "EC2101 Microeconomic Analysis I",
  "CS2100 Computer Organisation",
  "EG1311 Design and Make",
  "MA3252 Linear and Network Optimisation",
  "GEC1000 Cultures and Connections",
  "ME2142 Feedback Control Systems",
  "SW1101E Social Work and Society",
  "CS1101S Programming Methodology",
  "MA2002 Calculus",
  "CFG1002 Career Catalyst",
  "CS2106 Operating Systems",
  "SE1101E Southeast Asia: A Changing Region",
  "MA1521 Calculus for Computing",
  "ES2660 Communicating in the Information Age",
  "CS3244 Machine Learning",
  "EC1301 Principles of Economics",
  "HSH1000 The Human Condition",
  "GET1050 Computational Thinking",
  "MA2101 Linear Algebra II",
  "CS2105 Introduction to Computer Networks",
  "NM2207 Computational Media Literacy",
  "EE2033 Signals and Systems",
  "JS1101E Introduction to Japanese Studies",
  "CN2116 Chemical Kinetics and Reactor Design",
  "SOC1101 Sociological Perspectives",
  "ME3103 Computer Aided Design and Manufacturing",
  "PC1101 Frontiers of Physics",
  "CS2107 Introduction to Information Security",
  "IE2141 Systems Design and Dynamics",
  "GEH1049 Public Health in Action",
  "LSM1301 General Biology",
  "CM1102 Chemistry The Central Science",
  "MA2116 Probability",
  "EE4204 Computer Networks",
  "EN1101E An Introduction to Literary Studies",
  "DSA1101 Introduction to Data Science",
  "CE2407 Engineering Geology",
  "CS3203 Software Engineering Project",
  "BT1101 Introduction to Business Analytics",
  "MKT1705X Principles of Marketing",
  "ME2121 Thermodynamics",
  "IS1108 Digital Ethics and Data Privacy",
  "CH1101E Modern China",
  "CG2028 Computer Organization",
  "BSP1703 Managerial Economics",
  "MA1100 Fundamental Concepts of Mathematics",
  "EE2012 Analytical Methods in ECE",
  "LAJ1201 Japanese 1",
  "CE2134 Hydraulics",
  "CS3216 Software Product Engineering",
  "NM1101E New Media and Society",
  "IE3100 Systems Design and Analysis",
  "FIN2704X Finance",
  "PC1141 Introduction to Classical Mechanics",
  "GEH1036 Living with Mathematics",
  "CS2102 Database Systems",
  "AR1101 Introduction to Architectural Design",
  "LAK1201 Korean 1",
  "BN4206 Computational Methods in Biomedical Engineering",
  "DAO1704X Decision Analytics using Spreadsheets",
  "GES1035 Singapore Employment Law",
  "ME2162 Manufacturing Processes",
  "CP2106 Independent Software Development Project",
  "LAC1201 Chinese 1",
  "LL4398 University Research Opportunities Program",
  "EG2310 Fundamentals of Systems Design",
  "GEH1047 Social and Cultural Studies Through Music",
  "CS3245 Information Retrieval",
  "UTC1702B Engineering and Society",
];
