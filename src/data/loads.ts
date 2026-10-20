// Load pages: one per common barbell weight. Each page has its own text; the plates and tables are computed at build time.
export interface Load {
  unit: 'lb' | 'kg';
  weight: number;
  intro: string;   // what this load is, in plain words
  who: string;     // who lifts it and where it fits in a program
  tip: string;     // one practical loading or warm-up tip
}

export const loads: Load[] = [
  { unit: 'lb', weight: 95, intro: 'A 95 lb barbell is a 45 lb bar with one 25 lb plate on each side. It is a first stop for many new lifters.',
    who: 'People learning the bench press, the overhead press or the squat often start here. It is also a common warm-up weight for stronger lifters on pressing days.',
    tip: 'Light plates slide off the sleeve with very little tilt, so use collars even at this weight.' },
  { unit: 'lb', weight: 135, intro: 'A 135 lb barbell is one 45 lb plate on each side of a 45 lb bar. Lifters call it "one plate". It is the best-known milestone in the gym.',
    who: 'Reaching 135 lb on the bench press is a first goal for many beginners. For the squat and deadlift it is usually a warm-up weight after the first month or two.',
    tip: 'Check that both plates face the same way and sit against the shoulder of the bar. A plate that sits loose looks the same from the front but shifts during the lift.' },
  { unit: 'lb', weight: 185, intro: 'A 185 lb barbell is a 45 lb plate and a 25 lb plate on each side. Many people call it "a plate and a quarter".',
    who: 'It is a common bench press goal for new lifters, a common squat working weight for beginners, and a light set for experienced deadlifters.',
    tip: 'Put the 45 lb plate on first, then the 25 lb plate on the outside. The heavier plate sits close to the shoulder so the weight stays near your hands.' },
  { unit: 'lb', weight: 225, intro: 'A 225 lb barbell is two 45 lb plates on each side of a 45 lb bar. Lifters call it "two plates", and it is a big milestone on the bench press.',
    who: 'The number of reps a person can do with 225 lb is a common strength test. For squats and deadlifts it is a common mid-level working weight.',
    tip: 'Plan your warm-up ramp from the plates you already have in your hands. The ramp climbs from the empty bar to 225 lb with the plate changes kept small.' },
  { unit: 'lb', weight: 275, intro: 'A 275 lb barbell is two 45 lb plates and one 25 lb plate on each side. It sits between "two plates" and "three plates".',
    who: 'Many lifters hit 275 lb on the squat or the deadlift before they bench it. It is also a common top set for the bench press among stronger lifters.',
    tip: 'Three plates a side means six plates on the bar. Spread the weight evenly: finish one side, then match it on the other side, so the bar does not tip while you load.' },
  { unit: 'lb', weight: 315, intro: 'A 315 lb barbell is three 45 lb plates on each side of a 45 lb bar. Lifters call it "three plates", and it is a strong milestone for the squat and the deadlift.',
    who: 'A 315 lb squat or deadlift is a common goal for intermediate lifters. A 315 lb bench press is an advanced lift.',
    tip: 'With six big plates the sleeve gets crowded. If your plates are thick, check that the collar still closes. Bumper plates are thicker than iron plates of the same weight.' },
  { unit: 'lb', weight: 405, intro: 'A 405 lb barbell is four 45 lb plates on each side of a 45 lb bar. Lifters call it "four plates", and it is a famous milestone for the deadlift and the squat.',
    who: 'A 405 lb deadlift is a respected goal for many men, and a 405 lb squat marks a strong lifter. Few people bench this much.',
    tip: 'Eight plates on a standard sleeve is close to the limit. Many bars hold about ten plates in total per side, but thick plates fill the sleeve earlier.' },
  { unit: 'kg', weight: 60, intro: 'A 60 kg barbell is the 20 kg bar plus 20 kg on each side. It is a typical working weight for a new lifter on the squat or the bench.',
    who: 'Many new lifters in kilogram gyms reach 60 kg first on the squat and the overhead press. It is also a common warm-up for stronger people.',
    tip: 'Two 20 kg plates can look the same as two 25 kg plates from a distance. Read the number on the plate. Color codes differ between brands.' },
  { unit: 'kg', weight: 100, intro: 'A 100 kg barbell is the 20 kg bar plus 40 kg on each side. Kilogram lifters treat 100 kg as the big round number, like 225 lb in pounds.',
    who: 'A 100 kg bench press is a milestone for many lifters. Squats and deadlifts reach 100 kg earlier, often within the first year of training.',
    tip: 'You can make 40 kg a side with 25 + 15 or with 20 + 20. Both use two plates. The tool shows 25 + 15. Use 20 + 20 if you want two matching plates.' },
  { unit: 'kg', weight: 140, intro: 'A 140 kg barbell is the 20 kg bar plus 60 kg on each side. It is a serious working weight for the squat and the deadlift.',
    who: 'A 140 kg squat or deadlift is a common intermediate target. It is also a typical opener for a lifter in a first powerlifting meet.',
    tip: 'Use the 1.25 kg plates only for the last small jump. At 140 kg a 2.5 kg change in the total is under 2 percent, so you can skip them on a normal day.' },
];

export const slugFor = (l: Load) => `${l.weight}-${l.unit}-barbell-plates`;
