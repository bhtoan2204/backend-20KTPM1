pipeline {
    agent any
    stages {
        stage("Test") {
            steps {
                script {
                    // Clean workspace
                    deleteDir()

                    // Clone the repository
                    checkout scm

                    // Assuming your code is in a directory named 'app'
                    dir('app') {
                        echo "Running Test..."
                        sh "npm install"
                        sh "npm run test --if-present"
                    }
                }
            }
        }
    }
}
