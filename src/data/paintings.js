import superbug from '../assets/Superbug.jpg'
import poppingTheBubble from '../assets/Popping_the_Bubble.jpg'
import theCostOfControl from '../assets/The_Cost_of_Control.jpg'
import armsRace from '../assets/Arms_Race.jpg'
import antimicrobialExpress from '../assets/Antimicrobial_Express.jpg'
import resilienceAgainstOverwhelmingResistance from '../assets/Resilience_Against_Overwhelming_Resistance.jpg'
import resistPlease from '../assets/Resist_Please.jpg'
import kyjuanWashingtonUntitled from '../assets/Kyjuan_Washington_Untitled.jpg'
import sicilyEsparzaUntitled from '../assets/Sicily_Esparza_Untitled.jpg'
import ourMedicinesAreLosingTheirPowers from '../assets/Our_Medicines_Are_Losing_Their_Powers.jpg'
import monster from '../assets/Monster.jpg'
import cindyMaUntitled from '../assets/Cindy_Ma_Untitled.jpg'
import joavSilvaBastidaUntitled from '../assets/Joav_Silva_Bastida_Untitled.jpg'
import valerieCheng1 from '../assets/Valerie_Cheng_1.jpg'
import valerieCheng2 from '../assets/Valerie_Cheng_2.jpg'
import evolvingShadows from '../assets/Evolving_Shadows.jpg'
import jesusHernandezUntitled from '../assets/Jesus_Hernandez_Untitled.jpg'
import combatAMRs from '../assets/Combat_AMRs.jpg'
import claudetteHarrisUntitled from '../assets/Claudette_Harris_Untitled.jpg'
import dontGetSick from '../assets/Dont_Get_Sick.jpg'
import waysToPreventAntimicrobialResistance from '../assets/Ways_to_Prevent_Antimicrobial_Resistance.jpg'
import battleOfResistance from '../assets/Battle_of_Resistance.jpg'
import amr from '../assets/AMR.jpg'
import awarenessPoster from '../assets/Awareness_Poster.jpg'
import rayneSimmonsUntitled from '../assets/Rayne_Simmons_Untitled.jpg'

const paintings = [
  {
    id: 10,
    title: 'Superbug',
    artist: 'Indra Mungunsuh',
    description:
      'The illustration conveys the growing threat of antimicrobial resistance by depicting a "superbug" that has become too powerful due to its antibiotic resistance. The bursting capsules symbolize medicines losing their effectiveness as the bacteria adapt and fight back. The color palette was carefully chosen to really stand out and group the viewers attention. It\'s colorful, fun, and vibrant which invites curiosity to understand the message and intention. The artwork uses a dramatic, retro poster style to warn viewers that misuse of antibiotics can create stronger, harder-to-treat microbes, turning ordinary infections into serious public health challenges.',
    image: superbug,
  },
  {
    id: 11,
    title: 'Popping the Bubble',
    artist: 'Joaquin Torres-Morales',
    description:
      "A large hand, meant to represent actions that 'help' the evolution of antimicrobial resistance, threatens to pierce a balloon/bubble that holds the world's antimicrobial resistant pathogens. The pathogens are already at the balloon's surface but need help to escape.",
    image: poppingTheBubble,
  },
  {
    id: 12,
    title: 'The Cost of Control',
    artist: 'Sidney Abbott',
    description:
      'This piece is a visualization of a future in which the overuse of antibiotics and vaccines in industrial agriculture has pushed cattle beyond their biological and physical limits. This emaciated and decaying body of a cow stands as a metaphor for how medical intervention without restraint can break the very systems it was meant to protect. The deterioration of their body symbolizes the emergence of antimicrobial resistance in which bacterial pathogens evolve faster than medical treatments will be able to control them. Syringes pierce the animal from multiple directions, seemingly left there to rot and embed themselves in their skin. This highlights and, in turn, calls out the demand for relentless productivity and disease control within livestock production, and the growing ineffectiveness of those measures over time.',
    image: theCostOfControl,
  },
  {
    id: 13,
    title: 'Arms Race',
    artist: 'Ava Ross',
    description:
      'This piece I created is meant to represent bacteria being "armed" from overuse of antibiotics and failure to take them properly; since the strongest bacteria survive, they can go on to grow, multiply, and cause more harm to others.',
    image: armsRace,
  },
  {
    id: 14,
    title: 'Antimicrobial Express',
    artist: 'Yaretzi Morales',
    description:
      'My illustration is a western-style, train-hopping metaphor of antimicrobial resistance. Depicted is a train called the "Antimicrobial Express," which represents the medication we take to help fight infections. In this story, the medication has been taken excessively, and the microbes are learning how to successfully hitch a ride. This demonstrates their increasing resistance. Also shown are the sheriffs, or white blood cells, who finding it much harder to catch these outlaws. In other words, showing how our body\'s immune system can be affected by not following the correct dosage.',
    image: antimicrobialExpress,
  },
  {
    id: 15,
    title: 'Resilience Against Overwhelming Resistance',
    artist: 'Matt Rupp',
    description:
      'The crisis of AMR can feel like an overwhelming swarm at times, but despite its severity, I believe we always must maintain a sense of positivity and resilience. While Antibiotic medicines when used incorrectly may be a contributing factor to the AMR crisis, modern medicine itself is also a potential solution as it is constantly innovating and finding new ways to evolve just like Bacteria itself. The symbol for modern medicine in this piece, the pill capsule, serves a representation for humanity and its resilient nature to always maintain hope and positivity.',
    image: resilienceAgainstOverwhelmingResistance,
  },
  {
    id: 16,
    title: 'RESIST! PLEASE…',
    artist: 'Taylor Cooper',
    description:
      'My narrative behind this concept is a more fictionalized approach to the matter. I personally imagine a kingdom and their queen (the antimicrobials) defending their kingdom (the immune system/body) from the enemy (the potential of antimicrobial resistance happening).',
    image: resistPlease,
  },
  {
    id: 17,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Kyjuan Washington',
    description:
      'We currently have antibiotics in development which are extremely strong and experimental like "vancomycin 3". This made me think. What if the bacteria found a way to adapt to that new medication faster than we could fight it off? So in my piece you see the progression to stronger medication until it eventually falls off into darkness swallowed by the ever evolving darkness. The table the antibiotics are sitting on is to mirror bacteria on a petri dish going from gram positive to gram negative.',
    image: kyjuanWashingtonUntitled,
  },
  {
    id: 18,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Sicily Esparza',
    description:
      'My work is meant to highlight how the overuse of antibiotics can increase infections and the ability of the body to fight them.',
    image: sicilyEsparzaUntitled,
  },
  {
    id: 19,
    // TODO: no title was given; using the poster's own headline text until the artist confirms a title
    title: 'Our Medicines Are Losing Their Powers!',
    artist: 'Mia Urbieta',
    description:
      'This illustration shows a worried medicine pill struggling to fight off stronger resistant germs. It represents how overusing antibiotics weakens their effectiveness and allows bacteria to adapt. The goal is to raise public awareness about antimicrobial resistance and the need to use antibiotics responsibly to protect our health.',
    image: ourMedicinesAreLosingTheirPowers,
  },
  {
    id: 20,
    title: 'Monster',
    artist: 'Leonardo Ferme',
    // TODO: no separate description was given; using the poster's own caption text until the artist provides one
    description:
      'Improper use of antibiotics can lead to stronger bacteria that can survive, adapt, and thrive. Would you like to meet it?',
    image: monster,
  },
  {
    id: 21,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Cindy Ma',
    description:
      'My illustration shows how microbes become increasingly resistant to medicine over time. I thought of antimicrobial resistance like a game where one side levels down and the other levels up. In my piece, the medicine side is leveling down, while the microbes are leveling up. There is also a shield in front of the microbes’ side, showing how they block the medicine from reaching them. Overall, the artwork represents how microbes are becoming more resistant to medicine as time goes on.',
    image: cindyMaUntitled,
  },
  {
    id: 22,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Joav Silva Bastida',
    description:
      'For my piece, I decided to go on the route of using a scare tactic to grasp the attention of anyone passing by. The illustration is in black and white, using line-work in the background to represent the micro-organism infiltrating the bodies and included text "Medicine won\'t save you for long" as an informative.',
    image: joavSilvaBastidaUntitled,
  },
  {
    id: 23,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Valerie Cheng',
    description:
      'Through research and careful brainstorming I have decided I wanted to create public awareness of Antimicrobial Resistance through the form of storytelling. I chose to create a comic, presenting an everyday conversation between a father and his daughter regarding the subject. This way I can raise awareness of the subject, through an easy-going and digestible comic.',
    image: valerieCheng1,
  },
  {
    id: 24,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Valerie Cheng',
    description:
      'Through research and careful brainstorming I have decided I wanted to create public awareness of Antimicrobial Resistance through the form of storytelling. I chose to create a comic, presenting an everyday conversation between a father and his daughter regarding the subject. This way I can raise awareness of the subject, through an easy-going and digestible comic.',
    image: valerieCheng2,
  },
  {
    id: 25,
    title: 'Evolving Shadows',
    artist: 'Teresa To',
    description:
      'My illustration for the contest is about bacteria that have become resistant, highlighting how modern medicine is no longer effective against them. The piece represents their evolution in the shadow like how I title this artwork of mine and shows how they merge like the yin and yang symbol.',
    image: evolvingShadows,
  },
  {
    id: 26,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Jesus Hernandez',
    description:
      'My approach on creating the art is to do it via comic form. The reason I choose the medium of comics instead of any other medium is because I believe it is a great way to break down information and deliver it in a concise, fun, and engaging story. The art I have provided is a proof of concept of what I want the comic to be. Subject to further reworking and revision into the final product. I hope you find what I have to offer great for bringing awareness to the public.',
    image: jesusHernandezUntitled,
  },
  {
    id: 27,
    title: "Combat AMR's",
    artist: 'Lily Patterson',
    description:
      "I took a comic-like approach to this design because I felt that the contest's provided powerpoint had so much valuable information, that I thought it would be overwhelming for myself if I were to try and summarize it with a more traditional illustration. I wanted the viewer to have a clear visual path of information that could both convey quick bite-sized information as well as a more in depth advisement.",
    image: combatAMRs,
  },
  {
    id: 28,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Claudette Harris',
    description:
      'In my piece I wanted to show the microbe physically fighting against the medicine, humanize it in a way people are able to understand. What better way than to have it be a boxer.',
    image: claudetteHarrisUntitled,
  },
  {
    id: 29,
    title: 'Don’t Get Sick',
    artist: 'Eleanor "Ellie" Vega',
    // TODO: no separate description was given; using the poster's own explanatory text until the artist provides one
    description:
      "AMR is what happens when your body's microbes adapt to the antibiotics you may be taking. This is due to overconsumption of meds when you don't need them, causing your microbes to build up defense against whatever medicine you're taking, making the meds useless. Be aware and be safe: finish antibiotics when prescribed, stay aware of when you need to switch meds, and only take them when needed.",
    image: dontGetSick,
  },
  {
    id: 30,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Isa Williams',
    description:
      'In my art piece, I listed simple ways that could help people combat these antimicrobial resistances, for example, continuously practicing good hygiene in your everyday life!',
    image: waysToPreventAntimicrobialResistance,
  },
  {
    id: 31,
    title: 'Battle of Resistance',
    artist: 'Yuhan "Helen" Gu',
    description:
      "An illustration portraying the fight between bacteria and antibiotics. The composition makes it seem like we should cheer for the bacteria because it looks like it's defending itself from the attacks of the antibiotic pills.",
    image: battleOfResistance,
  },
  {
    id: 32,
    title: 'AMR',
    artist: 'Avi Schwank',
    description: '2026',
    image: amr,
  },
  {
    id: 33,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Percy Heggen',
    description:
      "I choose to do something simple, eye-catching and bright; abstract with a retro feeling. Its purpose is to bring the viewer's attention to the poster and then keep them curious enough to learn something about AMR. I wanted to make my poster friendly, easy to read, and purposefully keep the message simple and not too wordy. I am a digital illustrator with some background in experimental animation and graphic design and I was inspired by the work of Len Lye, who was often known to combine art with science. I used a program called Procreate to digitally render this piece and to add in the typed information.",
    image: awarenessPoster,
  },
  {
    id: 34,
    // TODO: artist has not finalized a title for this piece yet
    title: 'Title TBD',
    artist: 'Rayne "Dirt" Simmons',
    description:
      'The sketch is of two different pills representing antibiotics, and they are hanging up a poster on how to prevent AMR. The illustration is cartoonish as to make the subject approachable for all ages, and to not overwhelm people with information.',
    image: rayneSimmonsUntitled,
  },
]

export default paintings
