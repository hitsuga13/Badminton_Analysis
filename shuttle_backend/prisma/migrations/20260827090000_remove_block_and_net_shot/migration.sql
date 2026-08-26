DELETE FROM "TrainingRep"
WHERE "trainingSessionId" IN (
  SELECT "id"
  FROM "TrainingSession"
  WHERE "shot" IN ('Block', 'Net Shot')
);

DELETE FROM "TrainingSession"
WHERE "shot" IN ('Block', 'Net Shot');

DELETE FROM "ShotRecord"
WHERE "shot" IN ('Block', 'Net Shot');

DELETE FROM "ShotType"
WHERE "name" IN ('Block', 'Net Shot');
