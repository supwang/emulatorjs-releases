// Starts Node.js (nodejs-mobile) with the given arguments; Node's console output goes to the Android log ("EJS-node").
#include <jni.h>
#include <string>
#include <cstdlib>
#include <cstring>
#include <unistd.h>
#include <pthread.h>
#include <android/log.h>
#include "node.h"

static int pipeFd[2];
static void *logThread(void *) {
    char buf[1024];
    ssize_t n;
    while ((n = read(pipeFd[0], buf, sizeof(buf) - 1)) > 0) {
        if (buf[n - 1] == '\n') n--;
        buf[n] = 0;
        __android_log_write(ANDROID_LOG_INFO, "EJS-node", buf);
    }
    return nullptr;
}
static void startLogger() {
    setvbuf(stdout, nullptr, _IOLBF, 0);
    setvbuf(stderr, nullptr, _IONBF, 0);
    if (pipe(pipeFd) != 0) return;
    dup2(pipeFd[1], STDOUT_FILENO);
    dup2(pipeFd[1], STDERR_FILENO);
    pthread_t t;
    if (pthread_create(&t, nullptr, logThread, nullptr) == 0) pthread_detach(t);
}

extern "C" JNIEXPORT jint JNICALL
Java_site_couchvs_emulatorjs_NodeRunner_startNode(JNIEnv *env, jclass, jobjectArray arguments) {
    jsize argc = env->GetArrayLength(arguments);
    // Node wants all arguments in one block of memory
    size_t total = 0;
    for (jsize i = 0; i < argc; i++) {
        auto s = (jstring) env->GetObjectArrayElement(arguments, i);
        const char *c = env->GetStringUTFChars(s, nullptr);
        total += strlen(c) + 1;
        env->ReleaseStringUTFChars(s, c);
        env->DeleteLocalRef(s);
    }
    char *block = (char *) calloc(total, 1);
    char **argv = (char **) calloc(argc + 1, sizeof(char *));
    char *cur = block;
    for (jsize i = 0; i < argc; i++) {
        auto s = (jstring) env->GetObjectArrayElement(arguments, i);
        const char *c = env->GetStringUTFChars(s, nullptr);
        size_t len = strlen(c);
        memcpy(cur, c, len);
        cur[len] = 0;
        argv[i] = cur;
        cur += len + 1;
        env->ReleaseStringUTFChars(s, c);
        env->DeleteLocalRef(s);
    }
    startLogger();
    int rc = node::Start(argc, argv);
    free(argv);
    free(block);
    return rc;
}
