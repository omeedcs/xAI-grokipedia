# Euler's identity

Euler's identity is the equation \( e^{i\pi} + 1 = 0 \), a special case of Euler's formula \( e^{i\	heta} = \cos\	heta + i\sin\	heta \) obtained by substituting \( \	heta = \pi \). This relation unites five fundamental constants in mathematics—the base of the natural logarithm \( e \approx 2.71828 \), the imaginary unit \( i = \sqrt{-1} \), the circle constant \( \pi \approx 3.14159 \), and the additive identity 0 with the multiplicative identity 1—through exponentiation, multiplication by \( i \), and addition. Often hailed as the most beautiful equation in mathematics for its profound simplicity and interconnectedness of disparate mathematical domains, it exemplifies the elegance of complex analysis.

Leonhard Euler first presented the formula and its implications in his 1748 treatise *Introductio in analysin infinitorum*, where he laid foundational work in mathematical analysis. The derivation relies on the Taylor series expansion of the exponential function \( e^z = \sum_{n=0}^{\infty} \frac{z^n}{n!} \), extended to complex arguments; substituting \( z = i\	heta \) separates the series into real parts matching the cosine series \( \cos\	heta = \sum_{k=0}^{\infty} (-1)^k \frac{\	heta^{2k}}{(2k)!} \) and imaginary parts matching the sine series \( \sin\	heta = \sum_{k=0}^{\infty} (-1)^k \frac{\	heta^{2k+1}}{(2k+1)!} \). This equivalence holds due to the absolute convergence of the series for complex \( z \), ensuring the formula's validity across the complex plane.

The identity's significance extends beyond its aesthetic appeal, serving as a cornerstone in fields like electrical engineering, quantum mechanics, and signal processing, where it facilitates the representation of periodic phenomena using complex exponentials. For instance, it underpins the addition formulas for sine and cosine, such as \( \cos(\alpha + \beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta \), derived from the exponent law \( e^{i(\alpha + \beta)} = e^{i\alpha} e^{i\beta} \). Euler's identity also highlights the periodic nature of complex exponentials, as \( e^{2\pi i} = 1 \), linking exponential growth with circular motion in the complex plane.

## Background Concepts

### Complex Numbers

Complex numbers extend the real number system by incorporating the imaginary unit \(i\), defined by the equation \(i^2 = -1\). A complex number \(z\) is expressed in rectangular form as \(z = a + bi\), where \(a\) and \(b\) are real numbers, with \(a\) known as the real part \(\operatorname{Re}(z)\) and \(b\) as the imaginary part \(\operatorname{Im}(z)\). This construction forms the set \(\mathbb{C}\) of all complex numbers, which constitutes an algebraically closed field under the usual operations, embedding the real numbers as a subfield when \(b = 0\).

Basic arithmetic operations on complex numbers follow from their representation as ordered pairs \((a, b)\). Addition is performed component-wise: \((a + bi) + (c + di) = (a + c) + (b + d)i\). Multiplication utilizes the distributive property and the relation \(i^2 = -1\), yielding \((a + bi)(c + di) = (ac - bd) + (ad + bc)i\). The complex conjugate of \(z = a + bi\), denoted \(\bar{z}\), is \(a - bi\), which satisfies \(\bar{z} = z\) if and only if \(z\) is real, and plays a key role in computing the modulus \(|z| = \sqrt{z \bar{z}} = \sqrt{a^2 + b^2}\). Subtraction and division are derived accordingly, with division requiring the nonzero conjugate in the denominator to rationalize.

In polar form, a nonzero complex number \(z\) is represented as \(z = r (\cos \	heta + i \sin \	heta)\), where \(r = |z|\) is the modulus (a nonnegative real number) and \(\	heta = \arg(z)\) is the argument (the angle from the positive real axis to the line connecting the origin to \(z\) in the complex plane, defined up to multiples of \(2\pi\)). The argument is computed as \(\	heta = \	an^{-1}(b/a)\) with adjustments for the correct quadrant. This form facilitates operations like multiplication and exponentiation by converting to products of moduli and sums of arguments.

The framework of complex numbers is essential as a prerequisite for Euler's identity, as it provides the algebraic foundation to meaningfully define and manipulate functions with complex arguments, such as extending the real exponential function to the entire complex plane.

### Exponential and Trigonometric Functions

The exponential, sine, and cosine functions, originally defined for real arguments, extend analytically to complex arguments through their Taylor series expansions, which converge everywhere in the complex plane \(\mathbb{C}\). The complex exponential is defined by the power series  
\[
\exp(z) = \sum_{n=0}^{\infty} \frac{z^n}{n!} = 1 + z + \frac{z^2}{2!} + \frac{z^3}{3!} + \cdots,
\]  
while the sine and cosine functions have  
\[
\sin(z) = \sum_{n=0}^{\infty} \frac{(-1)^n z^{2n+1}}{(2n+1)!} = z - \frac{z^3}{3!} + \frac{z^5}{5!} - \cdots
\]  
and  
\[
\cos(z) = \sum_{n=0}^{\infty} \frac{(-1)^n z^{2n}}{(2n)!} = 1 - \frac{z^2}{2!} + \frac{z^4}{4!} - \cdots.
\]  
These power series ensure uniform convergence on compact sets and allow the functions to be entire (holomorphic everywhere)./01%3A_Complex_Algebra_and_the_Complex_Plane/1.07%3A_The_Exponential_Function)

A key property arises when substituting a purely imaginary argument into the exponential series, \( z = i\	heta \) with \(\	heta\) real. The even powers of \(i\	heta\) contribute to the cosine series and the odd powers to the sine series, yielding  
\[
e^{i\	heta} = \cos \	heta + i \sin \	heta.
\]  
For general complex \( z = a + bi \), this gives \( e^z = e^a (\cos b + i \sin b) \), separating real exponential growth from oscillatory behavior. This relation reveals the periodic nature of the complex exponential along the imaginary axis, with period \( 2\pi i \) since \( e^{i(\	heta + 2\pi)} = e^{i\	heta} \cdot 1 = e^{i\	heta} \). Geometrically, \( e^{i\	heta} \) traces the unit circle in the complex plane as \( \	heta \) varies, representing rotations by angle \( \	heta \)./01%3A_Complex_Algebra_and_the_Complex_Plane/1.07%3A_The_Exponential_Function)

## Statement and Properties

### The Formula

Euler's identity is the equation

\[
e^{i\pi} + 1 = 0
\]

that equates the exponential of the imaginary unit times π to -1. This specific instance of Euler's formula connects five essential constants in mathematics: *e*, *i*, π, 1, and 0.

In the identity, *e* denotes the base of the natural logarithm, the unique real number approximately equal to 2.71828 satisfying \(\lim_{n \	o \infty} (1 + 1/n)^n = e\). The symbol *i* represents the imaginary unit, defined by the equation \(i = \sqrt{-1}\), which extends the real numbers to the complex plane. The constant π is the ratio of a circle's circumference to its diameter in Euclidean geometry, with approximate value 3.14159. The integer 1 serves as the multiplicative identity, meaning that for any real number *x*, \(1 \cdot x = x\). Similarly, 0 acts as the additive identity, such that \(0 + x = x\) for any real number *x*.

An initial verification of the identity follows directly from substituting θ = π into Euler's formula \(e^{i\	heta} = \cos \	heta + i \sin \	heta\), which gives \(e^{i\pi} = \cos \pi + i \sin \pi\). Since \(\cos \pi = -1\) and \(\sin \pi = 0\), this simplifies to \(e^{i\pi} = -1 + i \cdot 0 = -1\), and thus \(e^{i\pi} + 1 = 0\).

The identity's elegance in linking these disparate constants has led many to regard it as one of the most beautiful equations in mathematics.

### Verification and Basic Properties

One straightforward way to verify Euler's identity is through numerical approximation using established values of the constants involved. The value of \( e \) is approximately 2.71828, and \( \pi \) is approximately 3.1416. Substituting into the right-hand side of Euler's formula at angle \( \pi \), we have \( \cos \pi + i \sin \pi = -1 + i \cdot 0 = -1 \), since \( \cos \pi = -1 \) exactly and \( \sin \pi = 0 \) exactly. Thus, \( e^{i\pi} \approx -1 \), and adding 1 yields approximately 0, confirming the identity \( e^{i\pi} + 1 = 0 \) holds to high precision.

Euler's identity is unique in its concise relation among five fundamental mathematical constants: \( e \), \( i \), \( \pi \), 1, and 0. This connection underscores a profound unity in mathematics, linking the bases of exponential, imaginary, and trigonometric functions in a single equation, often described as one of the most remarkable formulas in the field. The identity exemplifies how disparate areas of mathematics—analysis, algebra, and geometry—interconnect through complex numbers.

A simple manipulation of the identity yields \( e^{i\pi} = -1 \), which highlights its role as the non-trivial solution to \( z^2 = 1 \) in the complex plane. This form reveals \( e^{i\pi} \) as a primitive second root of unity, since \( (e^{i\pi})^2 = e^{i 2\pi} = 1 \) and it is not 1 itself.

## Derivations

### Taylor Series Approach

One approach to deriving Euler's identity utilizes the Taylor series expansions of the exponential, sine, and cosine functions centered at zero. The Taylor series for the exponential function is given by

\[
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!},
\]

which converges for all real x. The series for the sine function is

\[
\sin x = \sum_{n=0}^{\infty} (-1)^n \frac{x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \frac{x^7}{7!} + \cdots,
\]

and for the cosine function,

\[
\cos x = \sum_{n=0}^{\infty} (-1)^n \frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \frac{x^6}{6!} + \cdots.
\]

These series converge for all real x.

To extend this to complex arguments, substitute x = iθ into the exponential series, where i is the imaginary unit and θ is real:

\[
e^{i\	heta} = \sum_{n=0}^{\infty} \frac{(i\	heta)^n}{n!}.
\]

The powers of i cycle every four terms: i^0 = 1, i^1 = i, i^2 = -1, i^3 = -i, and so on. Separating the real and imaginary parts yields

\[
e^{i\	heta} = \sum_{k=0}^{\infty} (-1)^k \frac{\	heta^{2k}}{(2k)!} + i \sum_{k=0}^{\infty} (-1)^k \frac{\	heta^{2k+1}}{(2k+1)!},
\]

which matches the Taylor series for cos θ and sin θ, respectively. Thus,

\[
e^{i\	heta} = \cos \	heta + i \sin \	heta.
\]

This equality holds for all real θ.

Specializing to θ = π gives

\[
e^{i\pi} = \cos \pi + i \sin \pi = -1 + i \cdot 0 = -1,
\]

so e^{iπ} + 1 = 0, which is Euler's identity.

The power series for the exponential function has an infinite radius of convergence and defines an entire function on the complex plane, converging absolutely and uniformly on every compact subset thereof. This ensures the validity of the term-by-term separation into real and imaginary parts.

### Limit Definition of Exponentials

One approach to deriving Euler's identity begins with the limit definition of the exponential function for real numbers, which is extended to the complex domain via analytic continuation. For a real number \(x\), the exponential function is defined as
\[
\exp(x) = \lim_{n \	o \infty} \left(1 + \frac{x}{n}\right)^n,
\]
where \(n\) is a positive integer. This limit converges for all real \(x\), providing a foundational characterization independent of series expansions. To extend this to complex \(z\), the real exponential is analytically continued to the entire complex plane, yielding \(\exp(z) = \lim_{n \	o \infty} \left(1 + \frac{z}{n}\right)^n\), valid because the partial sums approximate an entire function whose real restriction matches the limit definition./01%3A_Complex_Algebra_and_the_Complex_Plane/1.07%3A_The_Exponential_Function)

An equivalent and often more direct method for complex exponentials relies on solving a differential equation. The function \(f(z)\) satisfying \(f'(z) = f(z)\) with initial condition \(f(0) = 1\) uniquely defines the complex exponential \(\exp(z)\), as this functional equation captures the growth property extended from the reals. In the complex setting, solutions exist and are unique on the entire plane due to the Lipschitz continuity of the right-hand side, guaranteed by the Picard-Lindelöf theorem applied in \(\mathbb{C}\). This approach emphasizes the exponential as the generator of a one-parameter semigroup under differentiation.

To link this to trigonometric functions and derive Euler's formula, consider the specific case \(f(t) = \exp(it)\) for real \(t \u003e 0\), which satisfies the initial value problem \(f'(t) = i f(t)\) with \(f(0) = 1\). Decomposing \(f(t) = u(t) + i v(t)\) into real and imaginary parts yields the system
\[
u'(t) = -v(t), \quad v'(t) = u(t),
\]
with \(u(0) = 1\), \(v(0) = 0\). Differentiating the first equation gives \(u''(t) = -u(t)\), whose general solution is \(u(t) = A \cos t + B \sin t\); applying initial conditions determines \(A = 1\), \(B = 0\), so \(u(t) = \cos t\). Similarly, \(v(t) = \sin t\). Thus,
\[
\exp(it) = \cos t + i \sin t.
\]
Setting \(t = \pi\) produces \(\exp(i\pi) = \cos \pi + i \sin \pi = -1 + 0i = -1\), so \(\exp(i\pi) + 1 = 0\), which is Euler's identity.

This limit and differential equation framework provides a rigorous foundation distinct from the Taylor series approach, relying instead on the uniqueness of analytic continuations and ODE solutions to ensure the exponential's properties hold globally in the complex plane. The analytic continuation from the real limit to complex \(z\) is justified by the identity theorem for holomorphic functions, as the two definitions agree on the real line and define entire functions.

## Interpretations

### Geometric Interpretation

Euler's identity, \( e^{i\pi} + 1 = 0 \), finds a profound geometric interpretation in the complex plane, also known as the Argand diagram, where complex numbers are represented as points with real and imaginary coordinates. The expression \( e^{i\	heta} \) for real \( \	heta \) describes a point on the unit circle centered at the origin, with the real part given by \( \cos \	heta \) and the imaginary part by \( \sin \	heta \). As \( \	heta \) varies from 0 to \( 2\pi \), \( e^{i\	heta} \) traces this unit circle in a counterclockwise direction, embodying a rotation around the origin.

For the specific case of \( \	heta = \pi \), the point \( e^{i\pi} \) corresponds to a rotation of 180 degrees from the positive real axis, landing at -1 on the negative real axis. Adding 1 to this result shifts the point from -1 back to the origin, yielding zero and completing the identity. This visualization highlights the unit circle's role, where the exponential function with imaginary argument parametrizes circular motion rather than the logarithmic spiral associated with real arguments, though the latter provides an analogy for continuous growth in polar coordinates.

The intuitive appeal of this geometric view lies in its unification of fundamental constants: \( e \) represents exponential growth along the real line, \( i\	heta \) encodes rotation in the plane, and \( \pi \) defines the geometry of the circle, with the identity elegantly tying these elements at the point of opposition on the unit circle. This spatial perspective, building on the polar form of complex numbers, underscores the identity's role in bridging linear and angular concepts.

### Algebraic and Analytic Perspectives

From an algebraic perspective, Euler's identity \( e^{i\pi} + 1 = 0 \) embodies a profound minimal relation among the fundamental constants \( e \), \( \pi \), and \( i \), where the exponential term satisfies the linear polynomial equation \( x + 1 = 0 \) with root \( x = -1 \). This equation links the transcendental base \( e \) of the natural exponential and the transcendental angle measure \( \pi \) through the algebraic imaginary unit \( i \), forming an unexpected dependence in the field extension \( \mathbb{Q}(e, \pi, i) \). The relation's minimality arises from its degree-one form, which cannot be simplified further without trivializing the involvement of these constants, as established in transcendence theory.

The uniqueness of this relation is illuminated by results in transcendental number theory, particularly the Lindemann-Weierstrass theorem, which asserts that if \( \alpha \) is a nonzero algebraic number, then \( e^{\alpha} \) is transcendental. Applying this to \( \alpha = i\pi \) (algebraic if \( \pi \) were algebraic) yields \( e^{i\pi} = -1 \), an algebraic number, leading to a contradiction that proves \( \pi \)'s transcendence; similarly, Hermite's 1873 proof shows \( e \)'s transcendence. Under Schanuel's conjecture, which posits that for linearly independent \( \alpha_1, \dots, \alpha_n \) over \( \mathbb{Q} \), the field \( \mathbb{Q}(\alpha_1, \dots, \alpha_n, e^{\alpha_1}, \dots, e^{\alpha_n}) \) has transcendence degree at least \( n \), \( e \) and \( \pi \) are algebraically independent over \( \mathbb{Q} \), implying Euler's identity as the sole minimal algebraic bridge between them.

Analytically, the identity emerges as a special value of the entire function \( \exp(z) \), evaluated at \( z = i\pi \), and gains depth through analytic continuation on the Riemann surface of the complex logarithm. The logarithm \( \log(w) \) is multi-valued, with branches differing by \( 2\pi i k \) for integer \( k \), and the principal branch satisfies \( \log(-1) = i\pi \), directly inverting the identity via \( \exp(\log(-1)) = -1 \). This structure on the Riemann surface—the universal cover of \( \mathbb{C} \setminus \{0\} \)—highlights how the single-valued exponential projects onto the punctured plane, resolving the logarithm's branch points at 0 and infinity while preserving the relation across sheets.

The identity exemplifies the harmonious interplay of exponential, logarithmic, and trigonometric functions in complex analysis, where functional equations like \( \exp(z + 2\pi i) = \exp(z) \) underpin the periodicity shared with sine and cosine, defined as \( \cos z = \frac{\exp(iz) + \exp(-iz)}{2} \) and \( \sin z = \frac{\exp(iz) - \exp(-iz)}{2i} \). This unification via Euler's formula \( \exp(iz) = \cos z + i \sin z \) reveals a deep symmetry, allowing trigonometric identities to derive from exponential properties and vice versa, central to solving functional equations in the complex domain. While one geometric viewpoint interprets it as a 180-degree rotation on the unit circle, the algebraic and analytic lenses emphasize its role in field extensions and global function theory.

## Generalizations and Extensions

### Euler's Formula

Euler's formula expresses the complex exponential function in terms of trigonometric functions and states that for any real number \(\	heta\),

\[
e^{i\	heta} = \cos \	heta + i \sin \	heta.
\]

This relation connects the exponential function with circular functions, providing a bridge between algebraic and geometric interpretations in the complex plane.

One high-level approach to deriving this formula utilizes Taylor series expansions. The series for \(e^z\) is \(\sum_{n=0}^{\infty} \frac{z^n}{n!}\), while those for \(\cos \	heta\) and \(\sin \	heta\) are \(\sum_{n=0}^{\infty} (-1)^n \frac{\	heta^{2n}}{(2n)!}\) and \(\sum_{n=0}^{\infty} (-1)^n \frac{\	heta^{2n+1}}{(2n+1)!}\), respectively; substituting \(z = i\	heta\) yields matching even and odd terms that combine to form the right-hand side. Another outline draws from differential equations: the function \(f(\	heta) = e^{i\	heta}\) satisfies \(f'(\	heta) = i f(\	heta)\) with \(f(0) = 1\), and solving this while equating real and imaginary parts aligns with the derivatives of \(\cos \	heta\) and \(\sin \	heta\).

The formula implies key properties, including periodicity: \(e^{i(\	heta + 2\pi)} = e^{i\	heta} e^{i 2\pi} = e^{i\	heta} \cdot 1 = e^{i\	heta}\), since \(\cos 2\pi + i \sin 2\pi = 1\), making the period \(2\pi\). This periodicity underpins brief applications in Fourier analysis, where periodic signals are decomposed into sums of complex exponentials \(e^{in\	heta}\) for integer \(n\), facilitating efficient representation and computation of waveforms.

As a special case, substituting \(\	heta = \pi\) gives \(e^{i\pi} = \cos \pi + i \sin \pi = -1 + 0i = -1\), known as Euler's identity, which highlights the formula's role in unifying fundamental constants.

### Related Identities

Euler's identity \( e^{i\pi} + 1 = 0 \) represents the case \( n=2 \) in the broader family of nth roots of unity, which are the solutions to \( z^n = 1 \) in the complex plane. These roots are explicitly given by \( e^{2\pi i k / n} \) for integers \( k = 0, 1, \dots, n-1 \), forming the vertices of a regular n-gon inscribed in the unit circle centered at the origin. This generalization highlights how Euler's identity captures a fundamental rotational symmetry in complex numbers, where each root satisfies the equation and powers back to 1 after n steps.

Another extension arises by raising Euler's identity to integer powers, yielding \( e^{i \pi k} = (-1)^k \) for any integer \( k \). Here, the left side leverages the exponential form, while the right side reflects the alternating sign pattern from repeated half-turn rotations in the complex plane, with \( \sin(\pi k) = 0 \) and \( \cos(\pi k) = (-1)^k \). This form simplifies expressions involving sign alternations in series expansions and periodic functions.

These related identities underpin key applications across disciplines. In signal processing, the discrete Fourier transform (DFT) decomposes discrete signals into sums of complex exponentials using nth roots of unity as basis functions, enabling efficient frequency analysis through fast Fourier transform algorithms that exploit the geometric progression of these roots.

In quantum mechanics, phase factors \( e^{i \	heta} \) derived from Euler's formula describe the relative timing of wave function components, essential for phenomena like interference and time evolution under the Schrödinger equation, where global phases do not affect observables but relative phases determine measurable outcomes.

In quantum computing, single-qubit phase gates apply rotations via unitary matrices parameterized by Euler's formula, facilitating error-corrected quantum algorithms and simulations of molecular systems.

For numerical computations, evaluating \( e^{i \pi} \) directly in floating-point systems introduces small errors because π is irrational and approximated to finite precision, resulting in \( e^{i \pi} + 1 \
eq 0 \) exactly; to maintain stability and avoid cancellation errors, equivalent expressions like \( \cos \pi + i \sin \pi = -1 + 0i \) or direct assignment of -1 are preferred in software implementations.

## Historical Development

### Euler's Contribution

Leonhard Euler first presented the formula \( e^{i\	heta} = \cos \	heta + i \sin \	heta \) in his seminal 1748 publication *Introductio in analysin infinitorum*, a two-volume work intended as an introduction to infinite series and analysis. This equation, now known as Euler's formula, established a profound connection between the exponential function and trigonometric functions in the complex plane. Euler's work in this text built directly on prior developments in complex numbers, including Abraham de Moivre's 1722 trigonometric identity for powers of complex quantities and explorations of exponential series by Johann Bernoulli.

Euler popularized the notation \( e \) for the base of the natural logarithm in this publication, having introduced it in unpublished work in 1727 and first published it around 1731, and employed \( i \) or equivalent symbols for \( \sqrt{-1} \), though the modern \( i \) notation was formalized later in his career. His approach integrated these elements to extend the understanding of functions beyond real numbers, leveraging infinite series as a unifying tool.

To derive the formula, Euler equated the Taylor series expansion of the exponential function \( e^{ix} \) with the known series for \( \cos x \) and \( i \sin x \), demonstrating their identical form term by term. This series-based method not only confirmed the general formula but also implicitly revealed the special case for \( \	heta = \pi \), resulting in the identity \( e^{i\pi} + 1 = 0 \), which encapsulates five fundamental mathematical constants in a single elegant equation.

### Later Recognition and Impact

In the 19th century, the development of complex analysis by mathematicians such as Carl Friedrich Gauss and Bernhard Riemann provided a rigorous framework that elevated Euler's formula from an empirical observation to a cornerstone of analytic function theory, enabling deeper explorations of convergence and mapping properties in the complex plane. Gauss's introduction of the term "complex number" and his geometric interpretations built directly on Euler's exponential representation, while Riemann's work on analytic continuation and surfaces further integrated the formula into advanced topology and geometry.

During the 20th century, Euler's formula became integral to physics, particularly in quantum mechanics, where it underpins the time evolution of wave functions in the Schrödinger equation through complex exponentials that encode oscillatory behavior and phase shifts./03%3A_The_Schrodinger_Equation/3.02%3A_The_Time-Dependent_Schrodinger_Equation) Its role in signal processing and electrical engineering also facilitated widespread adoption in textbooks and curricula, making it a standard tool for teaching harmonic analysis and wave phenomena in undergraduate mathematics education.

The formula's cultural impact surged in the late 20th century, with mathematician Keith Devlin dubbing it "the most beautiful equation in mathematics" in a 2002 article, highlighting its elegant unification of fundamental constants. This perception was reinforced in media, including the 2017 Welch Labs documentary series that visually explored its connections to Fourier analysis and real-world applications. Polls further cemented its status, with a 1988 survey in The Mathematical Intelligencer naming it the most beautiful theorem and a 2004 Physics World reader poll selecting it as the greatest equation ever.

In recent years, as of 2025, developments in artificial intelligence have extended its influence, where Euler's formula supports Fourier feature mappings in neural networks to enhance representation of periodic data and phase information in tasks like time-series forecasting and image processing. In quantum computing, it remains essential for modeling qubit rotations and phase gates on the Bloch sphere.