const fs = require('fs');

const subjects = ['S001', 'S002', 'S003'];
const runs = ['R01', 'R02', 'R03'];
const samples = [];

subjects.forEach((subject, subjectIndex) => {
  runs.forEach(run => {
    const file = `${subject}${run}.edf`;

    for (let i = 0; i < 1000; i++) {

      const eeg =
        Math.sin(i * (0.08 + subjectIndex * 0.01)) * 35 +
        Math.sin(i * (0.22 + subjectIndex * 0.02)) * 15 +
        (Math.random() - 0.5) * 10;

      const emg =
        Math.abs(Math.sin(i * (0.15 + subjectIndex * 0.02))) * 30 +
        Math.random() * 8;

      const spike =
        eeg > 25
          ? Math.floor(Math.random() * 20) + 1
          : 0;

      samples.push({
        eeg,
        emg,
        spike,
        subject,
        file,
        timestamp: i,
        eegValue: eeg
      });
    }
  });
});

fs.writeFileSync('src/data/eeg_samples.json', JSON.stringify(samples, null, 2));
