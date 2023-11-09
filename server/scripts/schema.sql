\set ON_ERROR_STOP true
SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

-- ENUMS
CREATE TYPE muscle AS ENUM ('abdominals','hamstrings','adductors','quadriceps','biceps','shoulders','chest','middle back','calves','glutes','lower back','lats','triceps','traps','forearms','neck','abductors');
CREATE TYPE forceType AS ENUM ('pull','push','static');
CREATE TYPE levelType AS ENUM ('beginner','intermediate','expert');
CREATE TYPE mechanicType AS ENUM ('compound','isolation');
CREATE TYPE equipmentType AS ENUM ('body only','machine','other','foam roll','kettlebells','dumbbell','cable','barbell','bands','medicine ball','exercise ball','e-z curl bar');
CREATE TYPE categoryType AS ENUM ('strength','stretching','plyometrics','strongman','powerlifting','cardio','olympic weightlifting');

-- Create Exercises Table
DROP TABLE IF EXISTS exercises;
CREATE TABLE exercises (
  id UUID,
  name Text NOT NULL,
  aliases Text[],
  primary_muscles muscle[],
  secondary_muscles muscle[],
  force forceType,
  level levelType NOT NULL,
  mechanic mechanicType,
  equipment equipmentType,
  category categoryType NOT NULL,
  instructions Text[],
  description Text,
  tips Text[],
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT statement_timestamp(),
  PRIMARY KEY ("id"),
  UNIQUE ("name")
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	id            SERIAL PRIMARY KEY,
	email         VARCHAR(200) NOT NULL,
	password      VARCHAR(200) NOT NULL,
  token         VARCHAR(100) DEFAULT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT statement_timestamp(),
	UNIQUE (email)
);

DROP TABLE IF EXISTS plans;
CREATE TABLE plans(
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  user_id       INT NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT    fk_users FOREIGN KEY(user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS plan_exercises;
CREATE TABLE plan_exercises(
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL,
  plan_id       INT NOT NULL,
  exercise_id   UUID NOT NULL,
  CONSTRAINT    fk_plan FOREIGN KEY(plan_id) REFERENCES plans(id),
  CONSTRAINT    fk_exercise FOREIGN KEY(exercise_id) REFERENCES exercises(id),
  CONSTRAINT    fk_users FOREIGN KEY(user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS workouts;
CREATE TABLE workouts(
  id            SERIAL PRIMARY KEY,
  plan_id       INT DEFAULT NULL,
  user_id       INT NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT    fk_plan FOREIGN KEY(plan_id) REFERENCES plans(id),
  CONSTRAINT    fk_users FOREIGN KEY(user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS workout_sets;
CREATE TABLE workout_sets(
  id            SERIAL PRIMARY KEY,
  workout_id    INT NOT NULL,
  exercise_id   UUID NOT NULL,
  user_id       INT NOT NULL,
  weight        INT NOT NULL,
  reps          INT NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT    fk_workout FOREIGN KEY(workout_id) REFERENCES workouts(id),
  CONSTRAINT    fk_exercise FOREIGN KEY(exercise_id) REFERENCES exercises(id),
  CONSTRAINT    fk_users FOREIGN KEY(user_id) REFERENCES users(id)
);
