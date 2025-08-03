# GitHub Container Registry (GHCR) Setup Guide

## 🚨 **URGENT: Fix 403 Forbidden Errors**

The persistent 403 Forbidden errors suggest your GitHub repository needs manual configuration for Container Registry access.

## **Step 1: Enable GitHub Packages (Required)**

1. Go to your repository: **https://github.com/skpokala/ice-breaker-app**
2. Click **Settings** (top menu)
3. Scroll down to **Features** section
4. Look for **Packages** - make sure it's **ENABLED**
5. If disabled, click the checkbox to enable it

## **Step 2: Configure Repository Visibility**

1. In repository **Settings**
2. Go to **General** tab
3. Scroll to **Danger Zone**
4. Ensure repository visibility is set to **Public** (GHCR works best with public repos)
5. If private, you may need additional authentication steps

## **Step 3: Check Package Permissions**

1. Go to your repository **Settings**
2. Click **Actions** in left sidebar
3. Click **General**
4. Scroll to **Workflow permissions**
5. Select **Read and write permissions**
6. Check **Allow GitHub Actions to create and approve pull requests**
7. Click **Save**

## **Step 4: Manual GHCR Authentication Test**

Run this locally to test your personal access:

```bash
# Test GHCR access with your GitHub credentials
gh auth login  # Follow prompts
echo $(gh auth token) | docker login ghcr.io -u skpokala --password-stdin

# Try pushing a simple test image
docker pull alpine:latest
docker tag alpine:latest ghcr.io/skpokala/ice-breaker-app/test:manual
docker push ghcr.io/skpokala/ice-breaker-app/test:manual
```

## **Step 5: Test the Simplified Workflow**

After completing steps 1-3, trigger our test workflow:

```bash
# Commit and push the test workflow
git add .github/workflows/ghcr-test.yml
git commit -m "add: GHCR authentication test workflow"
git push --no-verify

# Create test branch to trigger the workflow
git checkout -b ghcr-test
git push --no-verify -u origin ghcr-test
```

## **Step 6: Check Results**

1. Go to **https://github.com/skpokala/ice-breaker-app/actions**
2. Look for **"GHCR Authentication Test"** workflow
3. Check if it passes or shows specific error messages

## **Common Issues & Solutions**

### **Issue**: "Package does not exist" 
**Solution**: Make sure Packages are enabled (Step 1)

### **Issue**: "Insufficient permissions"
**Solution**: Check workflow permissions (Step 3)

### **Issue**: "Token invalid"
**Solution**: Repository might be private - consider making it public temporarily

### **Issue**: "Registry not found"
**Solution**: GitHub Container Registry might not be initialized - try the manual test (Step 4)

## **Next Steps**

Once the test workflow passes:
1. The main docker-build.yml workflow should work
2. Images will be available at:
   - `ghcr.io/skpokala/ice-breaker-app/backend:latest`
   - `ghcr.io/skpokala/ice-breaker-app/frontend:latest`

## **Need Help?**

If issues persist after these steps, the problem might be:
- GitHub's GHCR service having temporary issues
- Account-level restrictions
- Corporate/organizational settings

Let me know what errors you see after trying these steps! 