pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22.15.0'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/NadaJuma/WebAutomationWithJenkins.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'node -v'
                bat 'npm -v'
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npx browserstack-node-sdk playwright test'
            }
        }
    }

    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}