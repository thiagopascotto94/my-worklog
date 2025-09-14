#!/bin/bash
cd frontend
npm install
npm start > ../frontend.log 2>&1 &
