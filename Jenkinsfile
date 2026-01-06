pipeline {
    agent any
  environment {
    BROWSERSTACK_USERNAME = credentials('browserstack-username')  
    BROWSERSTACK_ACCESS_KEY = credentials('browserstack-accesskey')
  }
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

        stage('Install Playwright') {
            steps {
                bat 'npx playwright install'
            }
        }

        stage('Run on BrowserStack') {
            steps {
                bat 'npx browserstack-node-sdk playwright test --config=playwright.config.ts'
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