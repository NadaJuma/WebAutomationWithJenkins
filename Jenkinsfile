pipeline {
    agent any
  // run daily (Jenkins uses server timezone)
    triggers {
        cron('0 22 * * *')   // daily at 10:00 PM
    }

  environment {
    BROWSERSTACK_USERNAME = credentials('browserstack-username')  
    BROWSERSTACK_ACCESS_KEY = credentials('browserstack-accesskey')


        // force CI mode for Playwright config
        CI = 'true'
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
                bat 'npm ci'
            }
        }

        stage('Install Playwright') {
            steps {
                bat 'npx playwright install'
            }
        }

/*        stage('Run on BrowserStack') {
            steps {
                bat 'npx browserstack-node-sdk playwright test --config=playwright.config.ts'
            }
        }
    }*/

      // ✅ REPLACE your single run stage with this parallel shard stage
        stage('Run on BrowserStack (4 Users / 4 Shards)') {
            parallel {

                stage('User1 - Shard 1/4') {
                    environment {
                        E2E_USERNAME = credentials('e2e-user1-username')
                        E2E_PASSWORD = credentials('e2e-user1-password')
                        PW_WORKERS = '1'
                    }
                    steps {
                        bat 'npx browserstack-node-sdk playwright test --config=playwright.config.ts --shard=1/4'
                    }
                }

                stage('User2 - Shard 2/4') {
                    environment {
                        E2E_USERNAME = credentials('e2e-user2-username')
                        E2E_PASSWORD = credentials('e2e-user2-password')
                        PW_WORKERS = '1'
                    }
                    steps {
                        bat 'npx browserstack-node-sdk playwright test --config=playwright.config.ts --shard=2/4'
                    }
                }

                stage('User3 - Shard 3/4') {
                    environment {
                        E2E_USERNAME = credentials('e2e-user3-username')
                        E2E_PASSWORD = credentials('e2e-user3-password')
                        PW_WORKERS = '1'
                    }
                    steps {
                        bat 'npx browserstack-node-sdk playwright test --config=playwright.config.ts --shard=3/4'
                    }
                }

                stage('User4 - Shard 4/4') {
                    environment {
                        E2E_USERNAME = credentials('e2e-user4-username')
                        E2E_PASSWORD = credentials('e2e-user4-password')
                        PW_WORKERS = '1'
                    }
                    steps {
                        bat 'npx browserstack-node-sdk playwright test --config=playwright.config.ts --shard=4/4'
                    }
                }
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