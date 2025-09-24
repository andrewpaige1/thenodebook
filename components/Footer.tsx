import React from "react";

const Footer: React.FC = () => (
  <footer className="w-full border-t bg-white/80 backdrop-blur-sm py-8 px-4 mt-12 text-xs text-gray-600">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
      <div>
        <div className="font-bold text-base text-gray-800 mb-2">Mindthred</div>
        <div className="mb-2">For support: <a href="mailto:mindthred@gmail.com" className="underline">mindthred@gmail.com</a></div>
      </div>
      <div className="flex flex-col gap-2">
        <details className="mb-2">
          <summary className="cursor-pointer font-semibold">Terms of Service</summary>
          <div className="mt-2 max-h-64 overflow-y-auto pr-2 text-xs leading-relaxed">
            <strong>Effective Date:</strong> September 23, 2025<br/><br/>
            Welcome to Mindthred! These Terms of Service (“Terms”) govern your access to and use of the Mindthred website, products, and services (“Services”). By accessing or using Mindthred, you agree to these Terms. If you do not agree, do not use our Services.<br/><br/>
            <strong>1. Eligibility</strong><br/>
            You must be at least 13 years old to use Mindthred. By using our Services, you represent and warrant that you meet this requirement.<br/><br/>
            <strong>2. Account Registration and Security</strong><br/>
            - You must register for an account to access certain features.<br/>
            - We use Auth0 to manage authentication and registration. By registering, you agree to Auth0’s terms and privacy policy.<br/>
            - You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.<br/><br/>
            <strong>3. User Content</strong><br/>
            - You may create, upload, and manage flashcards, mind maps, and related content (“User Content”).<br/>
            - You retain ownership of your User Content, but grant Mindthred a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content as necessary to provide the Services.<br/>
            - You are responsible for ensuring your User Content does not violate any laws or third-party rights.<br/><br/>
            <strong>4. Data Collection and Use</strong><br/>
            <em>a. Data We Collect</em><br/>
            We collect and store the following information:<br/>
            - Account information (nickname, Auth0 ID, email, etc.)<br/>
            - Flashcard sets, flashcards, mind maps, and their relationships<br/>
            - User progress, scores, and activity timestamps<br/>
            - Mind map node layouts and connections<br/>
            - Local storage data for tracking your study progress<br/>
            - Authentication and session cookies via Auth0<br/><br/>
            <em>b. Use of OpenAI API</em><br/>
            - When you use certain features (e.g., text extraction or AI-powered suggestions), your data may be sent to the OpenAI API for processing.<br/>
            - By using these features, you consent to the transfer and processing of your data by OpenAI, subject to their <a href="https://openai.com/policies/terms-of-use" target="_blank" rel="noopener noreferrer" className="underline">terms</a> and <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">privacy policy</a>.<br/><br/>
            <em>c. How We Use Your Data</em><br/>
            - To provide, maintain, and improve the Services<br/>
            - To personalize your experience and track your progress<br/>
            - To ensure security and prevent abuse<br/>
            - To comply with legal obligations<br/><br/>
            <strong>5. Privacy Policy</strong><br/>
            Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your information.<br/><br/>
            <strong>6. Acceptable Use</strong><br/>
            You agree not to:<br/>
            - Use the Services for any unlawful purpose<br/>
            - Upload or share content that is illegal, harmful, or infringes on others’ rights<br/>
            - Attempt to access or tamper with other users’ data<br/>
            - Reverse engineer or disrupt the Services<br/><br/>
            <strong>7. Termination</strong><br/>
            We may suspend or terminate your access to Mindthred at any time, with or without notice, for conduct that violates these Terms or is otherwise harmful to the Services or users.<br/><br/>
            <strong>8. Disclaimers</strong><br/>
            - Mindthred is provided “as is” without warranties of any kind.<br/>
            - We do not guarantee the accuracy, reliability, or availability of the Services.<br/>
            - Mindthred is not responsible for any loss or damage resulting from your use of the Services.<br/><br/>
            <strong>9. Limitation of Liability</strong><br/>
            To the fullest extent permitted by law, Mindthred and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services.<br/><br/>
            <strong>10. Changes to These Terms</strong><br/>
            We may update these Terms from time to time. We will notify you of significant changes by posting a notice on our website or via email. Continued use of the Services constitutes acceptance of the updated Terms.<br/><br/>
            <strong>11. Contact</strong><br/>
            For questions about these Terms, contact us at: <a href="mailto:support@mindthred.com" className="underline">support@mindthred.com</a>
          </div>
        </details>
        <details>
          <summary className="cursor-pointer font-semibold">Privacy Policy</summary>
          <div className="mt-2 max-h-64 overflow-y-auto pr-2 text-xs leading-relaxed">
            <strong>Effective Date:</strong> September 23, 2025<br/><br/>
            <strong>1. Information We Collect</strong><br/>
            - Account Data: Nickname, Auth0 ID, email, and authentication data.<br/>
            - User Content: Flashcards, mind maps, scores, and study progress.<br/>
            - Usage Data: Interactions with the Services, device information, and cookies.<br/>
            - Third-Party Data: Data processed by OpenAI when using AI features.<br/><br/>
            <strong>2. How We Use Information</strong><br/>
            - To provide and improve Mindthred<br/>
            - To personalize your experience<br/>
            - For analytics and security<br/>
            - To comply with legal obligations<br/><br/>
            <strong>3. Data Sharing</strong><br/>
            - OpenAI: Data sent to OpenAI for AI-powered features is subject to their policies.<br/>
            - Auth0: Authentication data is managed by Auth0.<br/>
            - Legal: We may disclose data if required by law or to protect our rights.<br/><br/>
            <strong>4. Data Security</strong><br/>
            We use industry-standard measures to protect your data. However, no system is 100% secure.<br/><br/>
            <strong>5. Your Rights</strong><br/>
            You may access, update, or delete your account information at any time. Contact us for assistance.<br/><br/>
            <strong>6. Cookies and Local Storage</strong><br/>
            We use cookies and local storage to manage sessions and track progress.<br/><br/>
            <strong>7. Changes to This Policy</strong><br/>
            We may update this Privacy Policy. We will notify you of significant changes.<br/><br/>
            <strong>8. Contact</strong><br/>
            For privacy questions, contact: <a href="mailto:mindthred@gmail.com" className="underline">mindthred@gmail.com</a>
          </div>
        </details>
      </div>
    </div>
  </footer>
);

export default Footer;
